import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  author?: string;
  createdAt: string;
  updatedAt: string;
  readTime: number;
  abstract: string;
  keyTakeaways: string[];
  prerequisites: string[];
  relatedArticles: string[];
  version: string;
}

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'content', 'knowledge');

/**
 * 从 MD 文件加载知识库文章列表
 */
function loadArticlesFromMarkdown(): KnowledgeArticle[] {
  const articles: KnowledgeArticle[] = [];
  
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    console.log('Knowledge base directory not found:', KNOWLEDGE_BASE_DIR);
    return articles;
  }
  
  console.log('Loading articles from:', KNOWLEDGE_BASE_DIR);
  const categories = fs.readdirSync(KNOWLEDGE_BASE_DIR);
  console.log('Categories found:', categories);
  
  for (const category of categories) {
    const categoryDir = path.join(KNOWLEDGE_BASE_DIR, category);
    
    if (!fs.statSync(categoryDir).isDirectory()) {
      console.log('Skipping non-directory:', category);
      continue;
    }
    
    const files = fs.readdirSync(categoryDir);
    console.log(`Category ${category}: ${files.length} files`);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 解析元数据（支持 YAML frontmatter 和行内格式）
      const frontmatter: Record<string, any> = {};
      
      // 尝试 YAML frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const lines = frontmatterMatch[1].split('\n');
        for (const line of lines) {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length > 0) {
            let value = valueParts.join(':').trim();
            // 安全处理：确保 value 是字符串
            if (typeof value === 'string') {
              if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/"/g, ''));
                frontmatter[key.trim()] = value;
              } else if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
                frontmatter[key.trim()] = value;
              } else {
                frontmatter[key.trim()] = value;
              }
            }
          }
        }
      } else {
        // 尝试行内格式（第二行）：> **分类**: xxx | **编号**: xxx
        const lines = content.split('\n');
        const secondLine = lines[1] || '';
        console.log(`Parsing file ${file}, second line: ${secondLine.slice(0, 100)}`);
        
        if (secondLine.startsWith('>')) {
          const inlineMatch = secondLine.match(/\*\*([^*]+)\*\*:\s*([^|]+)/g);
          if (inlineMatch) {
            console.log(`Found ${inlineMatch.length} inline metadata items`);
            for (const item of inlineMatch) {
              const parts = item.split(':');
              const key = parts[0]?.trim();
              const value = parts.slice(1).join(':').trim();
              if (key && typeof value === 'string') {
                const cleanKey = key.replace(/\*\*/g, '').toLowerCase();
                const cleanValue = value.replace(/\*\*/g, '').trim();
                frontmatter[cleanKey] = cleanValue;
                console.log(`  ${cleanKey}: ${cleanValue}`);
              }
            }
          }
        }
      }
      
      // 估算阅读时长（假设每分钟 300 字）
      const wordCount = content.length / 3;
      const readTime = Math.ceil(wordCount / 300);
      
      // 从文件名提取标题（如果没有 frontmatter）
      const fileName = file.replace('.md', '');
      const titleFromFileName = fileName.replace(/^[0-9]+[-_]?/, '').replace(/_/g, ' ');
      
      // 解析难度（从行内格式或默认）
      let difficulty = '⭐⭐';
      if (frontmatter.difficulty) {
        difficulty = frontmatter.difficulty;
      } else if (content.includes('难度**: ⭐⭐⭐')) {
        difficulty = '⭐⭐⭐';
      } else if (content.includes('难度**: ⭐')) {
        difficulty = '⭐';
      }
      
      articles.push({
        id: fileName,
        title: frontmatter.title || frontmatter['编号'] || titleFromFileName,
        category: frontmatter.category || category,
        difficulty: difficulty,
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [category],
        author: frontmatter.author || '',
        createdAt: frontmatter.createdAt || frontmatter['更新时间'] || new Date().toISOString(),
        updatedAt: frontmatter.updatedAt || frontmatter['更新时间'] || new Date().toISOString(),
        readTime,
        abstract: content.slice(0, 300).replace(/[#*`\n]/g, '') + '...',
        keyTakeaways: [],
        prerequisites: [],
        relatedArticles: [],
        version: 'v1.0'
      });
    }
  }
  
  return articles;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    
    // 从 MD 文件加载
    let articles = loadArticlesFromMarkdown();
    
    // 筛选
    if (category) {
      articles = articles.filter(a => a.category === category);
    }
    
    if (tag) {
      articles = articles.filter(a => a.tags?.includes(tag));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      articles = articles.filter(a => 
        a.title.toLowerCase().includes(searchLower) ||
        a.abstract.toLowerCase().includes(searchLower) ||
        a.tags?.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    // 按分类分组
    const categories = Array.from(new Set(articles.map(a => a.category)))
      .map(cat => ({
        name: cat,
        count: articles.filter(a => a.category === cat).length
      }));
    
    return NextResponse.json({
      success: true,
      data: {
        articles,
        categories,
        total: articles.length
      }
    });
  } catch (error) {
    console.error('Error loading knowledge articles:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load knowledge articles'
    }, { status: 500 });
  }
}

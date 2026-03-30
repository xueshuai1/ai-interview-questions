import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Question {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  source: string;
  sourceUrl: string;
  collectedAt: string;
}

interface QuestionWithContent extends Question {
  description: string;
  answer?: {
    summary: string;
    coreFormula?: string;
    sections: Array<{
      title: string;
      content: string;
      code?: {
        language: string;
        code: string;
        explanation?: string;
      };
    }>;
  };
  evaluation?: {
    knowledge: string;
    ability: string;
    thinking: string;
  };
  followUpQuestions?: Array<{
    question: string;
    points: number;
    answerHint?: string;
  }>;
}

const QUESTIONS_DIR = path.join(process.cwd(), 'content', 'questions');

/**
 * 从 MD 文件加载题目
 */
function loadQuestionsFromMarkdown(): Question[] {
  const questions: Question[] = [];
  
  if (!fs.existsSync(QUESTIONS_DIR)) {
    return questions;
  }
  
  const categories = fs.readdirSync(QUESTIONS_DIR);
  
  for (const category of categories) {
    const categoryDir = path.join(QUESTIONS_DIR, category);
    
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    
    const files = fs.readdirSync(categoryDir);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // 解析 frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
      const frontmatter: Record<string, any> = {};
      
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
      }
      
      questions.push({
        id: file.replace('.md', ''),
        title: frontmatter.title || file.replace('.md', '').replace(/^[^-]+-/, ''),
        category: frontmatter.category || category,
        difficulty: frontmatter.difficulty || '⭐⭐',
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        source: frontmatter.source || '',
        sourceUrl: frontmatter.sourceUrl || '',
        collectedAt: frontmatter.collectedAt || '',
      });
    }
  }
  
  return questions;
}

export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // 从 MD 文件加载
    let questions = loadQuestionsFromMarkdown() as QuestionWithContent[];
    
    // 筛选
    if (category) {
      questions = questions.filter(q => q.category === category);
    }
    
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }
    
    if (tag) {
      questions = questions.filter(q => q.tags?.includes(tag));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      questions = questions.filter(q => 
        q.title.toLowerCase().includes(searchLower) ||
        q.description?.toLowerCase().includes(searchLower) ||
        q.tags?.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    // 统计
    const total = questions.length;
    
    // 分页
    const paginatedQuestions = questions.slice(offset, offset + limit);
    
    // 构建树状结构
    const facets = {
      categories: Array.from(new Set(questions.map(q => q.category)))
        .map(cat => ({ name: cat, count: questions.filter(q => q.category === cat).length })),
      difficulties: Array.from(new Set(questions.map(q => q.difficulty)))
        .map(diff => ({ name: diff, count: questions.filter(q => q.difficulty === diff).length })),
      tags: Array.from(questions.flatMap(q => q.tags || []))
        .reduce((acc, tag) => {
          const existing = acc.find(t => t.name === tag);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ name: tag, count: 1 });
          }
          return acc;
        }, [] as Array<{ name: string; count: number }>)
        .sort((a, b) => b.count - a.count)
        .slice(0, 50)
    };
    
    return NextResponse.json({
      success: true,
      data: {
        questions: paginatedQuestions,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        facets
      }
    });
  } catch (error) {
    console.error('Error loading questions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load questions'
    }, { status: 500 });
  }
}

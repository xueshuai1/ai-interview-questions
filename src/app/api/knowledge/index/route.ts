import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'content', 'knowledge');

/**
 * 获取分类下的所有文章列表（按文件名排序）
 */
function getArticlesByCategory(category: string): Array<{ id: string; title: string; summary: string; keyPoints: string[]; estimatedTime: string }> {
  const categoryDir = path.join(KNOWLEDGE_BASE_DIR, category);
  
  if (!fs.existsSync(categoryDir)) {
    return [];
  }
  
  const files = fs.readdirSync(categoryDir)
    .filter(file => file.endsWith('.md'))
    .sort();
  
  const articles = files.map(file => {
    const id = file.replace('.md', '');
    const filePath = path.join(categoryDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 解析标题
    const titleMatch = content.match(/^#\s+(.+)/);
    const title = titleMatch ? titleMatch[1].trim() : id;
    
    // 解析摘要（从第二行或前 100 字）
    const summaryMatch = content.match(/^>\s*\*\*分类\*\*.*\n\n(.+?)(?:\n|$)/);
    let summary = summaryMatch ? summaryMatch[1].trim() : '';
    if (!summary) {
      summary = content.slice(0, 100).replace(/[#*`\n]/g, '').trim() + '...';
    }
    
    // 解析关键要点（从难度或前几个列表项）
    const keyPoints: string[] = [];
    const difficultyMatch = content.match(/\*\*难度\*\*:\s*(⭐+)/);
    if (difficultyMatch) {
      keyPoints.push(difficultyMatch[1]);
    }
    
    // 估算阅读时间
    const wordCount = content.length / 3;
    const estimatedTime = `${Math.ceil(wordCount / 300)}分钟`;
    
    return {
      id,
      title,
      summary,
      keyPoints,
      estimatedTime
    };
  });
  
  return articles;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const articleId = searchParams.get('articleId');
    
    if (!category || !articleId) {
      return NextResponse.json({
        success: false,
        error: 'Missing category or articleId'
      }, { status: 400 });
    }
    
    const articles = getArticlesByCategory(category);
    const currentIndex = articles.findIndex(a => a.id === articleId);
    
    if (currentIndex === -1) {
      return NextResponse.json({
        success: false,
        error: 'Article not found'
      }, { status: 404 });
    }
    
    const prev = currentIndex > 0 ? articles[currentIndex - 1] : null;
    const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
    
    return NextResponse.json({
      success: true,
      prev,
      next,
      total: articles.length,
      currentIndex
    });
  } catch (error) {
    console.error('Error loading article navigation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load article navigation'
    }, { status: 500 });
  }
}

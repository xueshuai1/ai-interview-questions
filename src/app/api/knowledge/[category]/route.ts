import { NextRequest, NextResponse } from 'next/server';
import matter from 'gray-matter';
import fs from 'fs';
import path from 'path';

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  estimatedTime: string;
  order: number;
  content: string;
}

const KNOWLEDGE_DIR = path.join(process.cwd(), 'content/knowledge');

function loadCategoryArticles(category: string): Article[] {
  const categoryDir = path.join(KNOWLEDGE_DIR, category);
  const articles: Article[] = [];
  
  if (!fs.existsSync(categoryDir)) {
    return articles;
  }
  
  const files = fs.readdirSync(categoryDir)
    .filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(categoryDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(content);
    
    articles.push({
      id: file.replace('.md', ''),
      title: data.title || file.replace('.md', '').replace(/^[^-]+-/, ''),
      category: data.category || category,
      summary: data.summary || data.description || '',
      keyPoints: data.keyPoints || data.tags || [],
      estimatedTime: data.estimatedTime || data.readTime || '',
      order: data.order || 0,
      content: body,
    });
  }
  
  articles.sort((a, b) => a.order - b.order);
  
  return articles;
}

function getArticle(category: string, articleId: string): Article | null {
  const articles = loadCategoryArticles(category);
  const decodedId = decodeURIComponent(articleId);
  
  return articles.find(a => {
    if (a.id === decodedId) return true;
    if (decodeURIComponent(a.id) === decodedId) return true;
    return false;
  }) || null;
}

function getAdjacentArticles(category: string, articleId: string) {
  const articles = loadCategoryArticles(category);
  const decodedId = decodeURIComponent(articleId);
  
  const currentIndex = articles.findIndex(a => a.id === decodedId || decodeURIComponent(a.id) === decodedId);
  
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }
  
  const prev = currentIndex > 0 ? articles[currentIndex - 1] : null;
  const next = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  
  return { prev, next };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  const { category } = await params;
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get('articleId');
  
  if (!category) {
    return NextResponse.json(
      { error: 'Missing category parameter' },
      { status: 400 }
    );
  }
  
  if (articleId) {
    const article = getArticle(category, articleId);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found', availableArticles: loadCategoryArticles(category).map(a => a.id) },
        { status: 404 }
      );
    }
    
    const { prev, next } = getAdjacentArticles(category, articleId);
    
    return NextResponse.json({
      article,
      prev: prev ? { id: prev.id, title: prev.title } : null,
      next: next ? { id: next.id, title: next.title } : null,
    });
  } else {
    const articles = loadCategoryArticles(category);
    return NextResponse.json({
      category,
      articles: articles.map(a => ({
        id: a.id,
        title: a.title,
        summary: a.summary,
        keyPoints: a.keyPoints,
        estimatedTime: a.estimatedTime,
        order: a.order,
      })),
      total: articles.length,
    });
  }
}

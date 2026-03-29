import { NextResponse } from 'next/server';
import matter from 'gray-matter';
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

const QUESTIONS_DIR = path.join(process.cwd(), 'questions');

export async function GET() {
  const questions: Question[] = [];
  
  if (!fs.existsSync(QUESTIONS_DIR)) {
    return NextResponse.json({ 
      questions: [],
      error: 'Questions directory not found'
    });
  }
  
  // 获取所有分类目录
  const categories = fs.readdirSync(QUESTIONS_DIR);
  
  for (const category of categories) {
    const categoryDir = path.join(QUESTIONS_DIR, category);
    
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    
    // 获取分类下的所有文件
    const files = fs.readdirSync(categoryDir);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(content);
      
      questions.push({
        id: file.replace('.md', ''),
        title: data.title || file.replace('.md', '').replace(/^[^-]+-/, ''),
        category: data.category || category,
        difficulty: data.difficulty || '⭐⭐',
        tags: data.tags || [],
        source: data.source || '',
        sourceUrl: data.sourceUrl || '',
        collectedAt: data.collectedAt || '',
      });
    }
  }
  
  // 按分类排序
  questions.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.title.localeCompare(b.title);
  });
  
  return NextResponse.json({ 
    questions,
    total: questions.length,
    categories: [...new Set(questions.map(q => q.category))]
  });
}

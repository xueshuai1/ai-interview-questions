import { NextRequest, NextResponse } from 'next/server';
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
  content: string;
}

const QUESTIONS_DIR = path.join(process.cwd(), 'questions');

function getAllQuestions(): Question[] {
  const questions: Question[] = [];
  
  if (!fs.existsSync(QUESTIONS_DIR)) {
    console.error('Questions directory not found:', QUESTIONS_DIR);
    return questions;
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
      const { data, content: body } = matter(content);
      
      questions.push({
        id: file.replace('.md', ''),
        title: data.title || file.replace('.md', '').replace(/^[^-]+-/, ''),
        category: data.category || category,
        difficulty: data.difficulty || '⭐⭐',
        tags: data.tags || [],
        source: data.source || '',
        sourceUrl: data.sourceUrl || '',
        collectedAt: data.collectedAt || '',
        content: body,
      });
    }
  }
  
  return questions;
}

function getQuestionById(questions: Question[], id: string): Question | null {
  // URL 编码解码处理
  const decodedId = decodeURIComponent(id);
  
  // 尝试多种匹配方式
  return questions.find(q => {
    // 完全匹配
    if (q.id === decodedId) return true;
    // 解码后匹配
    if (decodeURIComponent(q.id) === decodedId) return true;
    // 去掉分类前缀匹配
    const qIdWithoutPrefix = q.id.replace(/^[^-]+-/, '');
    const decodedIdWithoutPrefix = decodedId.replace(/^[^-]+-/, '');
    if (qIdWithoutPrefix === decodedIdWithoutPrefix) return true;
    return false;
  }) || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const questions = getAllQuestions();
  
  if (id === 'list') {
    return NextResponse.json({ questions });
  }
  
  const question = getQuestionById(questions, id);
  
  if (!question) {
    console.error('Question not found:', id, 'Available questions:', questions.map(q => q.id));
    return NextResponse.json(
      { error: 'Question not found', availableCount: questions.length },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ question });
}

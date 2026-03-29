import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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

const QUESTIONS_DIR = path.join(process.cwd(), 'content/questions');

function getAllQuestions(): Question[] {
  const questions: Question[] = [];
  
  if (!fs.existsSync(QUESTIONS_DIR)) {
    return questions;
  }
  
  const categories = fs.readdirSync(QUESTIONS_DIR);
  
  for (const category of categories) {
    const categoryDir = path.join(QUESTIONS_DIR, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    
    const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(categoryDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data, content: body } = matter(content);
      
      questions.push({
        id: file.replace('.md', ''),
        title: data.title || file.replace('.md', ''),
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

function getQuestionById(id: string): Question | null {
  const questions = getAllQuestions();
  return questions.find(q => q.id === id) || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  if (id === 'list') {
    const questions = getAllQuestions();
    return NextResponse.json({ questions });
  }
  
  const question = getQuestionById(id);
  
  if (!question) {
    return NextResponse.json(
      { error: 'Question not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ question });
}

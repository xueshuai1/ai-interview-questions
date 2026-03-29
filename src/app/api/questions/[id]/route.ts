import { NextRequest, NextResponse } from 'next/server';
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

const GITHUB_API = 'https://api.github.com/repos/xueshuai1/ai-interview-questions/contents';

async function fetchFromGitHub(path: string): Promise<any> {
  try {
    const response = await fetch(path, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      },
      // 缓存 5 分钟
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('GitHub API error:', error);
    return null;
  }
}

async function getAllQuestions(): Promise<Question[]> {
  const questions: Question[] = [];
  
  // 获取所有分类目录
  const categories = await fetchFromGitHub(GITHUB_API);
  if (!categories || !Array.isArray(categories)) {
    return questions;
  }
  
  for (const category of categories) {
    if (category.type !== 'dir') continue;
    
    // 获取分类下的所有文件
    const files = await fetchFromGitHub(category.url);
    if (!files || !Array.isArray(files)) continue;
    
    for (const file of files) {
      if (!file.name.endsWith('.md')) continue;
      
      // 获取文件内容
      const contentResponse = await fetch(file.download_url);
      if (!contentResponse.ok) continue;
      
      const content = await contentResponse.text();
      const { data, content: body } = matter(content);
      
      questions.push({
        id: file.name.replace('.md', ''),
        title: data.title || file.name.replace('.md', ''),
        category: data.category || category.name,
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
  return questions.find(q => q.id === decodedId || decodeURIComponent(q.id) === decodedId) || null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const questions = await getAllQuestions();
  
  if (id === 'list') {
    return NextResponse.json({ questions });
  }
  
  const question = getQuestionById(questions, id);
  
  if (!question) {
    return NextResponse.json(
      { error: 'Question not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ question });
}

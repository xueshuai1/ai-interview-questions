import * as fs from 'fs';
import * as path from 'path';

interface ArticleIndex {
  id: string;
  title: string;
  order: number;
  summary: string;
  keyPoints: string[];
  estimatedTime: string;
}

interface CategoryIndex {
  category: string;
  name: string;
  articles: ArticleIndex[];
}

export function loadCategoryIndex(category: string): CategoryIndex | null {
  try {
    const indexPath = path.join(process.cwd(), 'content', category, 'index.json');
    if (!fs.existsSync(indexPath)) {
      return null;
    }
    const content = fs.readFileSync(indexPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load index for ${category}:`, error);
    return null;
  }
}

export function getAdjacentArticles(category: string, currentId: string) {
  const index = loadCategoryIndex(category);
  if (!index) {
    return { prev: null, next: null };
  }

  const currentIndex = index.articles.findIndex(a => a.id === currentId);
  if (currentIndex === -1) {
    return { prev: null, next: null };
  }

  const prev = currentIndex > 0 ? index.articles[currentIndex - 1] : null;
  const next = currentIndex < index.articles.length - 1 ? index.articles[currentIndex + 1] : null;

  return { prev, next };
}

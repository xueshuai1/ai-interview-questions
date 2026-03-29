interface ArticleProgress {
  completed: boolean;
  completedAt?: string;
  progress: number; // 0-1, 阅读进度
  lastReadAt?: string;
}

interface CategoryProgress {
  [articleId: string]: ArticleProgress;
}

interface LearningProgressData {
  [category: string]: CategoryProgress | {
    totalArticles: number;
    completedArticles: number;
    learningStreak: number;
    lastStudyDate?: string;
  };
  stats: {
    totalArticles: number;
    completedArticles: number;
    learningStreak: number;
    lastStudyDate?: string;
  };
}

const STORAGE_KEY = 'ai-interview-learning-progress';

function getDefaultData(): LearningProgressData {
  return {
    stats: {
      totalArticles: 0,
      completedArticles: 0,
      learningStreak: 0,
    },
  };
}

export function loadProgress(): LearningProgressData {
  if (typeof window === 'undefined') {
    return getDefaultData();
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultData();
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load learning progress:', error);
    return getDefaultData();
  }
}

export function saveProgress(data: LearningProgressData) {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save learning progress:', error);
  }
}

export function markArticleRead(
  category: string,
  articleId: string,
  progress: number = 1
): LearningProgressData {
  const data = loadProgress();
  
  if (!data[category] || !(category in data && category !== 'stats')) {
    data[category] = {};
  }
  
  const today = new Date().toISOString().split('T')[0];
  
  // 更新文章进度
  (data[category] as CategoryProgress)[articleId] = {
    completed: progress >= 1,
    completedAt: progress >= 1 ? today : undefined,
    progress,
    lastReadAt: today,
  };
  
  // 更新统计
  updateStats(data);
  
  saveProgress(data);
  return data;
}

function updateStats(data: LearningProgressData) {
  let totalArticles = 0;
  let completedArticles = 0;
  
  Object.keys(data).forEach(key => {
    if (key === 'stats') return;
    
    const category = data[key] as CategoryProgress;
    totalArticles += Object.keys(category).length;
    completedArticles += Object.values(category).filter(p => p.completed).length;
  });
  
  // 计算学习连续天数
  const today = new Date().toISOString().split('T')[0];
  const lastDate = data.stats.lastStudyDate;
  
  if (lastDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastDate === yesterdayStr) {
      data.stats.learningStreak += 1;
    } else if (lastDate !== today) {
      data.stats.learningStreak = 1;
    }
    
    data.stats.lastStudyDate = today;
  }
  
  data.stats.totalArticles = totalArticles;
  data.stats.completedArticles = completedArticles;
}

export function getProgressForArticle(
  category: string,
  articleId: string
): ArticleProgress | null {
  const data = loadProgress();
  const categoryData = data[category] as CategoryProgress | undefined;
  return categoryData?.[articleId] || null;
}

export function getProgressSummary() {
  const data = loadProgress();
  return data.stats;
}

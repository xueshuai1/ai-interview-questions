"use client";

import { useEffect, useState } from 'react';
import ProgressPanel from '@/components/ProgressPanel';
import { loadProgress } from '@/lib/learningProgress';
import Link from 'next/link';
import ContentLayout from '@/components/ContentLayout';

interface ArticleProgress {
  completed: boolean;
  completedAt?: string;
  progress: number;
  lastReadAt?: string;
}

export default function LearningProgressPage() {
  const [progress, setProgress] = useState<any>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = loadProgress();
    setProgress(data);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <ContentLayout
        title="📚 学习进度"
        subtitle="追踪你的 AI 学习之旅"
        breadcrumbs={[
          { label: "首页", href: "/" },
          { label: "学习进度" },
        ]}
      >
        <div className="text-center py-12">
          <p className="text-gray-500">加载中...</p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      title="📚 学习进度"
      subtitle="追踪你的 AI 学习之旅"
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "学习进度" },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <ProgressPanel />
        
        {/* 按分类显示进度 */}
        {Object.keys(progress).filter(k => k !== 'stats').map(category => {
          const categoryData = progress[category] as Record<string, ArticleProgress>;
          const articleIds = Object.keys(categoryData);
          
          if (articleIds.length === 0) return null;
          
          return (
            <div key={category} className="mt-6 bg-white rounded-xl border p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                {category.toUpperCase()}
              </h2>
              <div className="space-y-3">
                {articleIds.map(articleId => {
                  const articleProgress = categoryData[articleId];
                  return (
                    <div 
                      key={articleId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-lg ${articleProgress.completed ? 'text-green-600' : 'text-gray-400'}`}>
                          {articleProgress.completed ? '✅' : '⏳'}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {articleId}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">
                          {Math.round(articleProgress.progress * 100)}%
                        </span>
                        <Link
                          href={`/knowledge/${category}/${articleId}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          继续学习 →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {Object.keys(progress).filter(k => k !== 'stats').length === 0 && (
          <div className="mt-6 bg-white rounded-xl border p-8 text-center">
            <p className="text-gray-500 mb-4">还没有学习记录</p>
            <Link
              href="/knowledge"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              开始学习
            </Link>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}

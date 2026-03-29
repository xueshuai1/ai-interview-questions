"use client";

import { useEffect, useState } from 'react';
import { getProgressSummary, loadProgress } from '@/lib/learningProgress';

interface ProgressStats {
  totalArticles: number;
  completedArticles: number;
  learningStreak: number;
}

export default function ProgressPanel() {
  const [stats, setStats] = useState<ProgressStats>({
    totalArticles: 0,
    completedArticles: 0,
    learningStreak: 0,
  });
  
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const summary = getProgressSummary();
    setStats(summary);
    setProgress(summary.totalArticles > 0 
      ? Math.round((summary.completedArticles / summary.totalArticles) * 100) 
      : 0);
  }, []);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span>📊</span>
        学习进度
      </h3>
      
      {/* 总体进度条 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">总进度</span>
          <span className="font-medium text-blue-600">{progress}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.completedArticles}</div>
          <div className="text-xs text-blue-700">已完成</div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.learningStreak}</div>
          <div className="text-xs text-orange-700">天连续学习</div>
        </div>
      </div>

      {/* 剩余学习 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          剩余 <span className="font-bold text-gray-900">{stats.totalArticles - stats.completedArticles}</span> 篇文章
        </div>
      </div>
    </div>
  );
}

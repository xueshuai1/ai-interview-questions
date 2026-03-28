"use client";

import { useState, useEffect, useCallback } from "react";

export interface Progress {
  articleId: string;
  completed: boolean;
  lastReadAt: string;
  timeSpent: number; // seconds
  quizScores: { quizId: string; score: number }[];
}

interface ProgressData {
  [articleId: string]: Progress;
}

const STORAGE_KEY = "ai-learning-progress";

export function useProgress(articleId?: string) {
  const [progress, setProgress] = useState<ProgressData>({});
  const [currentProgress, setCurrentProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载进度数据
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setProgress(data);
        if (articleId && data[articleId]) {
          setCurrentProgress(data[articleId]);
        }
      }
    } catch (error) {
      console.error("Failed to load progress:", error);
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  // 保存进度数据
  const saveProgress = useCallback((newProgress: ProgressData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error("Failed to save progress:", error);
    }
  }, []);

  // 标记文章为已读
  const markAsRead = useCallback(() => {
    if (!articleId) return;

    const now = new Date().toISOString();
    const updated: ProgressData = { ...progress };

    if (!updated[articleId]) {
      updated[articleId] = {
        articleId,
        completed: false,
        lastReadAt: now,
        timeSpent: 0,
        quizScores: [],
      };
    } else {
      updated[articleId] = {
        ...updated[articleId],
        lastReadAt: now,
      };
    }

    saveProgress(updated);
  }, [articleId, progress, saveProgress]);

  // 更新阅读时长
  const updateTimeSpent = useCallback((seconds: number) => {
    if (!articleId) return;

    const updated: ProgressData = { ...progress };
    if (updated[articleId]) {
      updated[articleId] = {
        ...updated[articleId],
        timeSpent: updated[articleId].timeSpent + seconds,
      };
      saveProgress(updated);
    }
  }, [articleId, progress, saveProgress]);

  // 标记文章为完成
  const markAsCompleted = useCallback(() => {
    if (!articleId) return;

    const updated: ProgressData = { ...progress };
    if (updated[articleId]) {
      updated[articleId] = {
        ...updated[articleId],
        completed: true,
        lastReadAt: new Date().toISOString(),
      };
    } else {
      updated[articleId] = {
        articleId,
        completed: true,
        lastReadAt: new Date().toISOString(),
        timeSpent: 0,
        quizScores: [],
      };
    }

    saveProgress(updated);
  }, [articleId, progress, saveProgress]);

  // 记录测验分数
  const recordQuizScore = useCallback((quizId: string, score: number) => {
    if (!articleId) return;

    const updated: ProgressData = { ...progress };
    if (!updated[articleId]) {
      updated[articleId] = {
        articleId,
        completed: false,
        lastReadAt: new Date().toISOString(),
        timeSpent: 0,
        quizScores: [{ quizId, score }],
      };
    } else {
      const existingQuizIndex = updated[articleId].quizScores.findIndex(
        (q) => q.quizId === quizId
      );

      if (existingQuizIndex >= 0) {
        updated[articleId].quizScores[existingQuizIndex] = { quizId, score };
      } else {
        updated[articleId].quizScores.push({ quizId, score });
      }
    }

    saveProgress(updated);
  }, [articleId, progress, saveProgress]);

  // 获取总进度统计
  const getStats = useCallback(() => {
    const articles = Object.values(progress);
    const total = articles.length;
    const completed = articles.filter((p) => p.completed).length;
    const totalTime = articles.reduce((sum, p) => sum + p.timeSpent, 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      totalTime,
      percentage,
    };
  }, [progress]);

  return {
    progress: currentProgress,
    allProgress: progress,
    loading,
    markAsRead,
    updateTimeSpent,
    markAsCompleted,
    recordQuizScore,
    getStats,
  };
}

export function getProgressStats(): {
  total: number;
  completed: number;
  totalTime: number;
  percentage: number;
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { total: 0, completed: 0, totalTime: 0, percentage: 0 };
    }

    const progress: ProgressData = JSON.parse(stored);
    const articles = Object.values(progress);
    const total = articles.length;
    const completed = articles.filter((p) => p.completed).length;
    const totalTime = articles.reduce((sum, p) => sum + p.timeSpent, 0);
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, totalTime, percentage };
  } catch {
    return { total: 0, completed: 0, totalTime: 0, percentage: 0 };
  }
}

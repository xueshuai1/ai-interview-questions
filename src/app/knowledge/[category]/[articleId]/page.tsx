"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import ContentLayout from "@/components/ContentLayout";
import CodeBlock from "@/components/CodeBlock";
import Callout from "@/components/Callout";
import Collapsible from "@/components/Collapsible";
import ArticleNav from "@/components/ArticleNav";
import ProgressPanel from "@/components/ProgressPanel";

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  keyPoints: string[];
  estimatedTime: string;
  content: string;
}

interface AdjacentArticles {
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
}

export default function KnowledgeArticlePage() {
  const params = useParams();
  const category = params.category as string;
  const articleId = params.articleId as string;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [adjacentArticles, setAdjacentArticles] = useState<AdjacentArticles>({ prev: null, next: null });
  const [articleProgress, setArticleProgress] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticle() {
      try {
        const response = await fetch(`/api/knowledge/${category}?articleId=${articleId}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data.article);
          setAdjacentArticles({ prev: data.prev, next: data.next });
        } else {
          const errorData = await response.json();
          setError(errorData.error || '文章不存在');
        }
      } catch (err) {
        console.error('Failed to load article:', err);
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    }
    
    loadArticle();
    
    // 加载学习进度
    const stored = localStorage.getItem('ai-interview-learning-progress');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const progress = data[category]?.[articleId];
        if (progress) {
          setArticleProgress(progress.progress);
          setIsCompleted(progress.completed);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    }
  }, [category, articleId]);

  const handleMarkAsRead = () => {
    const stored = localStorage.getItem('ai-interview-learning-progress');
    let data: any = { stats: { totalArticles: 0, completedArticles: 0, learningStreak: 0 } };
    
    if (stored) {
      try {
        data = JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse progress:', error);
      }
    }
    
    if (!data[category]) {
      data[category] = {};
    }
    
    const today = new Date().toISOString().split('T')[0];
    data[category][articleId] = {
      completed: true,
      completedAt: today,
      progress: 1,
      lastReadAt: today,
    };
    
    let totalArticles = 0;
    let completedArticles = 0;
    
    Object.keys(data).forEach((key: string) => {
      if (key === 'stats') return;
      const categoryData = data[key];
      totalArticles += Object.keys(categoryData).length;
      completedArticles += Object.values(categoryData).filter((p: any) => p.completed).length;
    });
    
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
    
    localStorage.setItem('ai-interview-learning-progress', JSON.stringify(data));
    
    setArticleProgress(1);
    setIsCompleted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563EB] mx-auto mb-4"></div>
          <p className="text-[#64748B]">加载中...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-4">文章不存在</h1>
          <p className="text-[#64748B] mb-6">{error || '文章不存在'}</p>
          <Link
            href={`/knowledge/${category}`}
            className="px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all"
          >
            ← 返回分类
          </Link>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <div className="sticky top-6 space-y-4">
      <ProgressPanel />
      
      <button 
        onClick={handleMarkAsRead}
        disabled={isCompleted}
        className={`w-full px-4 py-2 text-sm rounded-lg transition-colors font-medium ${
          isCompleted 
            ? 'bg-green-100 text-green-700 cursor-default' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isCompleted ? '✅ 已完成' : '📚 标记为已读'}
      </button>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
          <span>📈</span>
          本节进度
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600">阅读进度</span>
            <span className="text-blue-600 font-medium">{Math.round(articleProgress * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${articleProgress * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
          <span>🔗</span>
          相关推荐
        </h3>
        <ul className="space-y-2 text-xs">
          {adjacentArticles.prev && (
            <li>
              <Link
                href={`/knowledge/${category}/${adjacentArticles.prev.id}`}
                className="text-blue-600 hover:underline block"
              >
                ← {adjacentArticles.prev.title}
              </Link>
            </li>
          )}
          {adjacentArticles.next && (
            <li>
              <Link
                href={`/knowledge/${category}/${adjacentArticles.next.id}`}
                className="text-blue-600 hover:underline block"
              >
                {adjacentArticles.next.title} →
              </Link>
            </li>
          )}
          <li>
            <Link
              href={`/knowledge/${category}`}
              className="text-blue-600 hover:underline block"
            >
              浏览该分类所有文章
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );

  // 简单渲染 Markdown 内容
  const renderContent = (content: string) => {
    return (
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: content
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n/g, '<br/>')
        }}
      />
    );
  };

  return (
    <ContentLayout
      title={article.title}
      subtitle={article.summary}
      category={category}
      tags={article.keyPoints}
      breadcrumbs={[
        { label: "首页", href: "/" },
        { label: "知识库", href: "/knowledge" },
        { label: category.toUpperCase(), href: `/knowledge/${category}` },
        { label: "文章详情" },
      ]}
      sidebarContent={sidebarContent}
    >
      {renderContent(article.content)}

      {/* 上一篇/下一篇导航 */}
      <ArticleNav category={category} articleId={articleId} />

      {/* 下一步 */}
      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
        <Link
          href={`/knowledge/${category}`}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium"
        >
          浏览该分类其他文章
        </Link>
        <Link
          href="/knowledge"
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium"
        >
          返回知识库
        </Link>
        <Link
          href="/learning-progress"
          className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium"
        >
          查看学习进度
        </Link>
      </div>
    </ContentLayout>
  );
}

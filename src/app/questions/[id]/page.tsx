"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CodeBlock from "@/components/CodeBlock";
import Callout from "@/components/Callout";
import Collapsible from "@/components/Collapsible";

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

export default function QuestionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuestion() {
      try {
        const response = await fetch(`/api/questions/${id}`);
        if (response.ok) {
          const data = await response.json();
          setQuestion(data.question);
        } else {
          setError('题目不存在');
        }
      } catch (err) {
        setError('加载失败');
      } finally {
        setLoading(false);
      }
    }
    
    loadQuestion();
  }, [id]);

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

  if (error || !question) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#1E293B] mb-4">题目不存在</h1>
          <p className="text-[#64748B] mb-6">{error || '题目不存在'}</p>
          <Link
            href="/interview"
            className="px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all"
          >
            ← 返回题库
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white border-b border-[#E2E8F0]">
        <div className="container mx-auto px-4 py-6">
          <Link
            href="/interview"
            className="text-[#64748B] hover:text-[#2563EB] transition-colors mb-4 inline-block"
          >
            ← 返回题库
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-[#DBEAFE] text-[#1E40AF] text-sm rounded font-medium">
              {question.category}
            </span>
            <span className="text-sm text-[#64748B]">{question.difficulty}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1E293B] mb-4 leading-normal">
            {question.title}
          </h1>
          
          {question.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {question.source && (
            <p className="text-sm text-[#64748B]">
              来源：{question.source}
              {question.sourceUrl && (
                <a
                  href={question.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2563EB] hover:underline ml-2"
                >
                  查看原文 →
                </a>
              )}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-2xl border border-[#E2E8F0] p-8 shadow-sm">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: question.content.replace(/\n/g, '<br/>') }}
            />
          </article>

          {/* 导航 */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/interview"
              className="px-6 py-3 bg-[#2563EB] text-white rounded-xl hover:bg-[#1D4ED8] transition-all font-medium"
            >
              ← 返回题库
            </Link>
            <Link
              href={`/categories/${question.category}`}
              className="px-6 py-3 bg-white text-[#2563EB] border border-[#2563EB] rounded-xl hover:bg-[#F1F5F9] transition-all font-medium"
            >
              浏览该分类
            </Link>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-[#94A3B8] border-t border-[#E2E8F0] mt-8">
        <p className="text-sm">© 2026 AI 学习与面试大全 | Built with Next.js & Vercel</p>
      </footer>
    </div>
  );
}

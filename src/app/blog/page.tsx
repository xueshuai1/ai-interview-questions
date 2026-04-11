"use client";

import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";

const blogPosts = [
  {
    id: "blog-001",
    title: "2026 年 AI 领域十大趋势预测",
    summary: "从多模态大模型到 AI Agent 普及，从边缘 AI 到具身智能，盘点今年最值得关注的技术方向",
    date: "2026-04-10",
    author: "AI Master 团队",
    readTime: "10 min",
    category: "行业洞察",
    tags: ["趋势", "2026", "多模态"],
    cover: "🔮",
  },
  {
    id: "blog-002",
    title: "GPT-5 技术报告深度解读",
    summary: "OpenAI 最新发布的 GPT-5 在多模态推理、长上下文理解和代码生成方面实现了显著突破",
    date: "2026-04-08",
    author: "AI Master 团队",
    readTime: "15 min",
    category: "论文解读",
    tags: ["GPT-5", "OpenAI", "多模态"],
    cover: "📄",
  },
  {
    id: "blog-003",
    title: "AI Agent 在软件开发中的最佳实践",
    summary: "从代码审查到自动修复，从需求分析到架构设计，AI Agent 正在重塑软件开发流程",
    date: "2026-04-05",
    author: "AI Master 团队",
    readTime: "12 min",
    category: "实战经验",
    tags: ["AI Agent", "开发效率", "自动化"],
    cover: "🤖",
  },
  {
    id: "blog-004",
    title: "RAG vs Fine-tuning：如何选择？",
    summary: "检索增强生成和微调是增强 LLM 能力的两大主流方案，本文对比它们的适用场景和优缺点",
    date: "2026-04-02",
    author: "AI Master 团队",
    readTime: "14 min",
    category: "技术对比",
    tags: ["RAG", "Fine-tuning", "LLM"],
    cover: "⚖️",
  },
  {
    id: "blog-005",
    title: "从 0 到 1：用 LangChain 构建你的第一个 AI 应用",
    summary: "手把手教你使用 LangChain 框架搭建一个完整的 RAG 应用，包含文档加载、向量存储和问答接口",
    date: "2026-03-28",
    author: "AI Master 团队",
    readTime: "20 min",
    category: "实战教程",
    tags: ["LangChain", "RAG", "实战"],
    cover: "🛠️",
  },
  {
    id: "blog-006",
    title: "AI 安全与伦理：不可忽视的议题",
    summary: "随着 AI 能力的飞速提升，安全性、偏见、隐私保护等伦理问题变得越来越重要",
    date: "2026-03-25",
    author: "AI Master 团队",
    readTime: "10 min",
    category: "行业洞察",
    tags: ["安全", "伦理", "治理"],
    cover: "🛡️",
  },
];

export default function BlogPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍪</span>
              <span className="text-xl font-bold text-gradient">AI Master</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-slate-300 hover:text-white transition-colors">首页</Link>
              <Link href="/knowledge" className="text-slate-300 hover:text-white transition-colors">知识库</Link>
              <Link href="/tools" className="text-slate-300 hover:text-white transition-colors">工具集</Link>
              <Link href="/blog" className="text-brand-400 font-medium">博客</Link>
              <Link href="/about" className="text-slate-300 hover:text-white transition-colors">关于</Link>
            </div>
            <button
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-md">
            <div className="px-4 py-4 space-y-1">
              <Link href="/" className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>首页</Link>
              <Link href="/knowledge" className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>知识库</Link>
              <Link href="/tools" className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>工具集</Link>
              <Link href="/blog" className="block px-4 py-3 rounded-lg text-brand-400 bg-brand-500/10 font-medium text-lg" onClick={() => setMobileMenuOpen(false)}>博客</Link>
              <Link href="/about" className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>关于</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            📝 AI <span className="text-gradient">博客</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            深度解读 AI 前沿动态、技术对比、实战经验和行业洞察
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-6">
            {blogPosts.map((post, index) => (
              <article
                key={post.id}
                className={`group flex flex-col sm:flex-row gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-500/5 cursor-pointer ${
                  index === 0 ? "sm:col-span-2" : ""
                }`}
              >
                {/* Cover */}
                <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 shrink-0 ${
                  index === 0 ? "sm:w-48 sm:h-48" : "sm:w-32 sm:h-32"
                } w-full h-32 sm:h-auto`}>
                  <span className={index === 0 ? "text-6xl" : "text-4xl"}>{post.cover}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-500">{post.date}</span>
                    <span className="text-xs text-slate-500">📖 {post.readTime}</span>
                  </div>

                  <h2 className={`font-bold mb-2 group-hover:text-brand-300 transition-colors leading-snug ${
                    index === 0 ? "text-xl sm:text-2xl" : "text-lg"
                  }`}>
                    {post.title}
                  </h2>

                  <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">
                    {post.summary}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">✍️ {post.author}</span>
                    <div className="flex gap-2 flex-wrap">
                      {post.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-white/5 rounded text-xs text-slate-400">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination placeholder */}
          <div className="mt-12 flex items-center justify-center gap-2">
            <button className="px-4 py-2 bg-brand-600 rounded-lg text-sm font-medium">1</button>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-400 transition-colors">2</button>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-400 transition-colors">3</button>
            <span className="text-slate-500 px-2">...</span>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-slate-400 transition-colors">下一页 →</button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

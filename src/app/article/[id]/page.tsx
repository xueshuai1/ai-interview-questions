"use client";

import { articles } from "@/data/knowledge";
import Link from "next/link";
import { useState } from "react";
import Footer from "@/components/Footer";

const levelColors: Record<string, string> = {
  入门: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  进阶: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  高级: "bg-rose-500/10 text-rose-300 border-rose-500/20",
};

const categoryIcons: Record<string, string> = {
  ml: "📊",
  dl: "🧠",
  nlp: "💬",
  cv: "👁️",
  llm: "🤖",
  agent: "🦾",
};

const categoryNames: Record<string, string> = {
  ml: "机器学习",
  dl: "深度学习",
  nlp: "自然语言处理",
  cv: "计算机视觉",
  llm: "大语言模型",
  agent: "AI Agent",
};

// Generate related articles (same category, exclude current)
function getRelatedArticles(currentId: string, category: string) {
  return articles
    .filter((a) => a.category === category && a.id !== currentId)
    .slice(0, 3);
}

// Generate article content based on article metadata
function generateContent(article: (typeof articles)[0]) {
  const sections: { title: string; body: string }[] = [];

  // Introduction
  sections.push({
    title: "概述",
    body: article.summary +
      "。本文将从基础概念讲起，逐步深入到核心原理和实战应用，帮助你全面理解这一技术。",
  });

  // Core concepts based on category
  switch (article.category) {
    case "ml":
      sections.push({
        title: "核心概念",
        body: `在机器学习中，${article.title.replace(/：.*/, "")}是最基础也是最重要的概念之一。理解其数学原理对于掌握后续的算法至关重要。我们将从最直观的几何解释出发，逐步引入数学公式和推导过程。`,
      });
      sections.push({
        title: "数学原理",
        body: "机器学习算法的本质是优化问题。通过定义损失函数，我们寻找最优的参数使得模型在训练数据上的表现最佳。常见的优化方法包括梯度下降法、牛顿法等。在实际应用中，还需要考虑过拟合、欠拟合等问题，通过正则化、交叉验证等技术来提升模型的泛化能力。",
      });
      sections.push({
        title: "代码实现",
        body: "在实际编码中，我们通常使用 scikit-learn 等成熟的机器学习库来快速实现算法。关键步骤包括：数据预处理（标准化、归一化）、模型选择、训练、评估和调参。通过 Pipeline 可以将这些步骤串联起来，形成可复用的工作流。",
      });
      break;
    case "dl":
      sections.push({
        title: "核心概念",
        body: `深度学习通过多层神经网络学习数据的层次化表示。${article.title.replace(/：.*/, "")}是深度学习中不可或缺的一环。从感知机到现代深度网络， architectures 的演进推动了 AI 的快速发展。`,
      });
      sections.push({
        title: "架构设计",
        body: "深度网络的架构设计是一门艺术。层数、每层神经元数量、激活函数选择、连接方式等都会影响模型的性能。现代深度学习框架如 PyTorch 和 TensorFlow 提供了丰富的模块，让我们可以灵活搭建各种网络结构。",
      });
      sections.push({
        title: "训练技巧",
        body: "训练深度网络需要掌握多种技巧：学习率调度、权重初始化、Batch Normalization、Dropout 正则化、梯度裁剪等。此外，数据增强、迁移学习也是提升模型效果的重要手段。",
      });
      break;
    case "nlp":
      sections.push({
        title: "核心概念",
        body: `自然语言处理致力于让计算机理解和生成人类语言。${article.title.replace(/：.*/, "")}是 NLP 领域的关键技术。从传统的统计方法到深度学习方法，NLP 经历了巨大的变革。`,
      });
      sections.push({
        title: "文本表示",
        body: "文本表示是 NLP 的基础。从 one-hot 编码到词向量（Word2Vec、GloVe），再到上下文感知的预训练模型（BERT、GPT），文本表示的能力不断提升，推动了 NLP 各项任务的性能突破。",
      });
      sections.push({
        title: "应用场景",
        body: "NLP 技术广泛应用于机器翻译、情感分析、文本摘要、问答系统、信息抽取等场景。随着大语言模型的兴起，NLP 应用正变得更加智能和通用。",
      });
      break;
    case "cv":
      sections.push({
        title: "核心概念",
        body: `计算机视觉让机器能够「看」和理解图像。${article.title.replace(/：.*/, "")}是 CV 领域的核心任务之一。从传统图像处理方法到深度学习，CV 技术取得了革命性的进步。`,
      });
      sections.push({
        title: "关键技术",
        body: "卷积神经网络（CNN）是计算机视觉的基石。通过卷积层提取局部特征、池化层降维、全连接层分类，CNN 在图像识别、目标检测、图像分割等任务中取得了超越人类的表现。",
      });
      sections.push({
        title: "实战应用",
        body: "CV 技术已广泛应用于自动驾驶、医疗影像分析、工业质检、人脸识别、视频理解等领域。随着 Vision Transformer 的兴起，CV 领域正在经历新一轮的技术革新。",
      });
      break;
    case "llm":
      sections.push({
        title: "核心概念",
        body: `大语言模型是近年来 AI 领域最引人注目的突破。${article.title.replace(/：.*/, "")}是理解和应用大语言模型的关键。从 GPT 到 Claude，从 Llama 到 Gemini，大模型正在重塑人机交互的方式。`,
      });
      sections.push({
        title: "训练管线",
        body: "大语言模型的训练包含多个阶段：大规模语料预训练、指令微调（SFT）、基于人类反馈的强化学习（RLHF）。每个阶段都需要大量的计算资源和精心设计的训练策略。",
      });
      sections.push({
        title: "应用实践",
        body: "大语言模型的应用非常广泛：文本生成、代码编写、数据分析、对话系统、知识问答等。通过 Prompt Engineering、RAG（检索增强生成）、Fine-tuning 等技术，可以让大模型更好地服务于具体场景。",
      });
      break;
    case "agent":
      sections.push({
        title: "核心概念",
        body: `AI Agent 是能够自主感知、规划、决策和执行任务的智能体。${article.title.replace(/：.*/, "")}是构建高效 AI Agent 的重要基础。Agent 正在从单一工具调用走向复杂的自主决策系统。`,
      });
      sections.push({
        title: "架构设计",
        body: "一个完整的 AI Agent 通常包含以下核心组件：感知模块（理解环境信息）、记忆模块（存储和检索知识）、规划模块（制定行动方案）、执行模块（调用工具完成任务）。各模块之间的协同决定了 Agent 的整体能力。",
      });
      sections.push({
        title: "最佳实践",
        body: "构建实用的 AI Agent 需要考虑：任务分解策略、工具选择机制、错误处理与回退、多步推理能力、以及安全性约束。Multi-Agent 协作更是带来了角色分工、通信协议、冲突解决等新挑战。",
      });
      break;
  }

  sections.push({
    title: "总结与展望",
    body: `通过本文的学习，你应该对${article.title.replace(/：.*/, "")}有了全面的理解。AI 领域发展日新月异，持续学习和实践是保持竞争力的关键。建议结合实战项目加深理解，并关注最新的学术论文和技术动态。`,
  });

  return sections;
}

export function generateStaticParams() {
  return articles.map((article) => ({
    id: article.id,
  }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const article = articles.find((a) => a.id === params.id);
  if (!article) {
    return { title: "文章不存在 - AI Master" };
  }
  return {
    title: `${article.title} - AI Master`,
    description: article.summary,
    keywords: article.tags.join(", "),
  };
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = articles.find((a) => a.id === params.id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!article) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📄</div>
          <h1 className="text-2xl font-bold mb-2">文章不存在</h1>
          <p className="text-slate-400 mb-6">该文章可能已被删除或链接有误</p>
          <Link
            href="/knowledge"
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-medium transition-all"
          >
            返回知识库
          </Link>
        </div>
      </main>
    );
  }

  const relatedArticles = getRelatedArticles(article.id, article.category);
  const content = generateContent(article);
  const categoryIcon = categoryIcons[article.category] || "📄";
  const categoryName = categoryNames[article.category] || article.category;

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
              <Link href="/blog" className="text-slate-300 hover:text-white transition-colors">博客</Link>
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
              <Link href="/about" className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-lg" onClick={() => setMobileMenuOpen(false)}>关于</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Article Header */}
      <section className="pt-28 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">首页</Link>
            <span>/</span>
            <Link href="/knowledge" className="hover:text-slate-300 transition-colors">知识库</Link>
            <span>/</span>
            <span className="text-slate-400 truncate">{article.title}</span>
          </div>

          {/* Category badge */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/10 text-brand-300 rounded-full text-sm font-medium">
              {categoryIcon} {categoryName}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${levelColors[article.level]}`}>
              {article.level}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8 pb-8 border-b border-white/5">
            <span>📅 {article.date}</span>
            <span>📖 {article.readTime} 阅读</span>
            <span>🏷️ {article.tags.map((t) => `#${t}`).join(" ")}</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Summary block */}
          <div className="p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20 mb-12">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-brand-300 mb-2">文章摘要</h3>
                <p className="text-slate-300 leading-relaxed">{article.summary}</p>
              </div>
            </div>
          </div>

          {/* Content sections */}
          {content.map((section, i) => (
            <div key={i} className="mb-10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                {section.body}
              </p>
            </div>
          ))}

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">标签</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-sm text-slate-300 transition-colors cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">📚 相关文章推荐</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/article/${rel.id}`}
                  className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-500/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{categoryIcons[rel.category]}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${levelColors[rel.level]}`}>
                      {rel.level}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold group-hover:text-brand-300 transition-colors leading-snug line-clamp-2 mb-2">
                    {rel.title}
                  </h3>
                  <p className="text-slate-400 text-sm line-clamp-2">{rel.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center p-10 rounded-3xl bg-gradient-to-r from-brand-600/10 to-accent-600/10 border border-brand-500/20">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              继续你的 AI 学习之旅
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              浏览更多 AI 知识库文章，或者探索实用的 AI 工具
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/knowledge"
                className="px-8 py-3 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-brand-500/25 hover:-translate-y-0.5"
              >
                📚 浏览知识库
              </Link>
              <Link
                href="/tools"
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
              >
                🛠️ 探索工具集
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

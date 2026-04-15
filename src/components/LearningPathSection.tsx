"use client";

import { useState, useMemo } from "react";
import { articles, categories } from "@/data/knowledge";
import ArticleCard from "@/components/ArticleCard";

interface PhaseConfig {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  description: string;
  categoryKeys: string[];
  levels: string[];
  borderColor: string;
  bgGradient: string;
  dotColor: string;
  subPaths?: { emoji: string; label: string; categoryKeys: string[] }[];
}

interface RouteConfig {
  id: string;
  name: string;
  emoji: string;
  duration: string;
  description: string;
  activeColor: string;
  activeBg: string;
  lineGradient: string;
  phases: PhaseConfig[];
}

const MAX_ARTICLES_DEFAULT = 6;

// ==================== 路线定义 ====================

// 🚀 速成路线 — 先学会用起来（1-2 周就能上手）
const fastTrack: RouteConfig = {
  id: "fast",
  name: "速成路线",
  emoji: "🚀",
  duration: "1-2 周",
  description: "先学会用，再补基础",
  activeColor: "text-cyan-300",
  activeBg: "bg-cyan-500/20 shadow-lg shadow-cyan-500/10",
  lineGradient: "from-cyan-500/30 via-blue-500/30 via-purple-500/30 to-emerald-500/30",
  phases: [
    {
      id: "fast-prompt",
      title: "Prompt Engineering",
      emoji: "✏️",
      duration: "1-2 天",
      description: "学会和 AI 对话，掌握提示词编写技巧，这是使用 AI 的第一步",
      categoryKeys: ["llm"],
      levels: ["入门"],
      borderColor: "border-l-cyan-500",
      bgGradient: "from-cyan-500/5 to-transparent",
      dotColor: "bg-cyan-500",
    },
    {
      id: "fast-llm",
      title: "大语言模型应用",
      emoji: "🤖",
      duration: "3-5 天",
      description: "了解大语言模型原理，学会搭建 RAG 系统、调用 API 开发 AI 应用",
      categoryKeys: ["llm"],
      levels: ["入门", "进阶"],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
    {
      id: "fast-agent",
      title: "AI Agent 实战",
      emoji: "🦾",
      duration: "1 周",
      description: "搭建自己的 AI Agent，学会工具调用、多 Agent 协作",
      categoryKeys: ["agent"],
      levels: ["入门", "进阶"],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
    {
      id: "fast-project",
      title: "AI 工程化与实践",
      emoji: "🚀",
      duration: "1-2 周",
      description: "将 AI 应用部署到生产环境，学习最佳实践和真实项目",
      categoryKeys: ["aieng", "practice"],
      levels: ["入门", "进阶"],
      borderColor: "border-l-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
    },
  ],
};

// 📚 基础路线 — 系统学习（建议 2-3 个月）
const foundationRoute: RouteConfig = {
  id: "foundation",
  name: "基础路线",
  emoji: "📚",
  duration: "2-3 月",
  description: "循序渐进，系统学习",
  activeColor: "text-emerald-300",
  activeBg: "bg-emerald-500/20 shadow-lg shadow-emerald-500/10",
  lineGradient: "from-emerald-500/30 via-blue-500/30 via-purple-500/30 to-amber-500/30",
  phases: [
    {
      id: "foundation",
      title: "入门基础",
      emoji: "📚",
      duration: "2-3 周",
      description: "打好数学和机器学习基础，理解核心概念与常用算法",
      categoryKeys: ["math", "ml"],
      levels: ["入门"],
      borderColor: "border-l-emerald-500",
      bgGradient: "from-emerald-500/5 to-transparent",
      dotColor: "bg-emerald-500",
      subPaths: [
        { emoji: "📐", label: "数学基础", categoryKeys: ["math"] },
        { emoji: "📊", label: "机器学习", categoryKeys: ["ml"] },
      ],
    },
    {
      id: "core",
      title: "核心技术",
      emoji: "🧠",
      duration: "3-4 周",
      description: "掌握深度学习、NLP 和计算机视觉三大核心技术方向",
      categoryKeys: ["dl", "nlp", "cv"],
      levels: ["入门"],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
      subPaths: [
        { emoji: "🧠", label: "深度学习", categoryKeys: ["dl"] },
        { emoji: "💬", label: "NLP", categoryKeys: ["nlp"] },
        { emoji: "👁️", label: "计算机视觉", categoryKeys: ["cv"] },
      ],
    },
    {
      id: "advanced",
      title: "进阶提升",
      emoji: "🚀",
      duration: "4-5 周",
      description: "深入学习大语言模型和 AI Agent，理解前沿技术",
      categoryKeys: ["llm", "agent"],
      levels: ["入门", "进阶"],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
      subPaths: [
        { emoji: "🤖", label: "大语言模型", categoryKeys: ["llm"] },
        { emoji: "🦾", label: "AI Agent", categoryKeys: ["agent"] },
      ],
    },
    {
      id: "specialization",
      title: "专业方向",
      emoji: "🎯",
      duration: "按兴趣选择",
      description: "选择感兴趣的方向深入学习，构建完整 AI 技术栈",
      categoryKeys: ["rl", "genai", "multimodal", "aieng", "practice"],
      levels: ["入门"],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
      subPaths: [
        { emoji: "🎮", label: "强化学习", categoryKeys: ["rl"] },
        { emoji: "🎨", label: "生成式 AI", categoryKeys: ["genai"] },
        { emoji: "🔗", label: "多模态", categoryKeys: ["multimodal"] },
        { emoji: "🔧", label: "AI 工程化", categoryKeys: ["aieng"] },
        { emoji: "🌍", label: "实践应用", categoryKeys: ["practice"] },
      ],
    },
  ],
};

// 🛡️ AI 安全路线 — 守护 AI 世界（建议 1 个月）
const securityRoute: RouteConfig = {
  id: "security",
  name: "AI 安全",
  emoji: "🛡️",
  duration: "3-4 周",
  description: "了解 AI 安全风险，掌握防护技能",
  activeColor: "text-red-300",
  activeBg: "bg-red-500/20 shadow-lg shadow-red-500/10",
  lineGradient: "from-red-500/30 via-orange-500/30 via-yellow-500/30 to-emerald-500/30",
  phases: [
    {
      id: "sec-basics",
      title: "AI 伦理与公平性",
      emoji: "⚖️",
      duration: "1 周",
      description: "理解 AI 偏见、公平性、可解释性，建立正确的 AI 价值观",
      categoryKeys: ["ethics"],
      levels: ["入门"],
      borderColor: "border-l-red-500",
      bgGradient: "from-red-500/5 to-transparent",
      dotColor: "bg-red-500",
    },
    {
      id: "sec-privacy",
      title: "隐私保护 ML",
      emoji: "🔒",
      duration: "1-2 周",
      description: "学习差分隐私、联邦学习、安全多方计算等隐私保护技术",
      categoryKeys: ["ethics", "aieng"],
      levels: ["进阶", "高级"],
      borderColor: "border-l-orange-500",
      bgGradient: "from-orange-500/5 to-transparent",
      dotColor: "bg-orange-500",
    },
    {
      id: "sec-attack",
      title: "对抗攻击与防御",
      emoji: "🛡️",
      duration: "1-2 周",
      description: "了解对抗样本、模型逆向、成员推理等攻击方式及防御策略",
      categoryKeys: ["ethics", "dl"],
      levels: ["进阶", "高级"],
      borderColor: "border-l-yellow-500",
      bgGradient: "from-yellow-500/5 to-transparent",
      dotColor: "bg-yellow-500",
    },
  ],
};

// 🔧 工程师路线 — 从开发到部署（建议 1-2 个月）
const engineerRoute: RouteConfig = {
  id: "engineer",
  name: "工程师",
  emoji: "🔧",
  duration: "1-2 月",
  description: "AI 工程化全流程，从开发到上线",
  activeColor: "text-amber-300",
  activeBg: "bg-amber-500/20 shadow-lg shadow-amber-500/10",
  lineGradient: "from-amber-500/30 via-green-500/30 via-blue-500/30 to-purple-500/30",
  phases: [
    {
      id: "eng-ml",
      title: "机器学习工程化",
      emoji: "📊",
      duration: "2 周",
      description: "从实验到生产，掌握特征工程、模型训练、评估全流程",
      categoryKeys: ["ml"],
      levels: ["入门", "进阶"],
      borderColor: "border-l-amber-500",
      bgGradient: "from-amber-500/5 to-transparent",
      dotColor: "bg-amber-500",
    },
    {
      id: "eng-dl",
      title: "深度学习工程化",
      emoji: "🧠",
      duration: "2-3 周",
      description: "分布式训练、混合精度、模型优化，掌握高效训练技能",
      categoryKeys: ["dl"],
      levels: ["进阶", "高级"],
      borderColor: "border-l-green-500",
      bgGradient: "from-green-500/5 to-transparent",
      dotColor: "bg-green-500",
    },
    {
      id: "eng-mlops",
      title: "MLOps 与部署",
      emoji: "🚀",
      duration: "2-3 周",
      description: "ML 流水线、模型版本管理、容器化部署、监控与漂移检测",
      categoryKeys: ["mlops", "aieng"],
      levels: ["入门", "进阶"],
      borderColor: "border-l-blue-500",
      bgGradient: "from-blue-500/5 to-transparent",
      dotColor: "bg-blue-500",
    },
    {
      id: "eng-practice",
      title: "实践项目",
      emoji: "🌍",
      duration: "2 周",
      description: "推荐系统、智能客服、异常检测等真实项目实战",
      categoryKeys: ["practice"],
      levels: ["入门", "进阶"],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
  ],
};

// 🎨 创意 AI 路线 — 生成式 AI 实战（建议 3-4 周）
const creativeRoute: RouteConfig = {
  id: "creative",
  name: "创意 AI",
  emoji: "🎨",
  duration: "3-4 周",
  description: "掌握图像、音频、视频生成技术",
  activeColor: "text-pink-300",
  activeBg: "bg-pink-500/20 shadow-lg shadow-pink-500/10",
  lineGradient: "from-pink-500/30 via-purple-500/30 via-cyan-500/30 to-emerald-500/30",
  phases: [
    {
      id: "cre-genai",
      title: "生成式 AI 基础",
      emoji: "🎨",
      duration: "1-2 周",
      description: "理解扩散模型、VAE、GAN 等生成模型原理与应用",
      categoryKeys: ["genai"],
      levels: ["入门", "进阶"],
      borderColor: "border-l-pink-500",
      bgGradient: "from-pink-500/5 to-transparent",
      dotColor: "bg-pink-500",
    },
    {
      id: "cre-multimodal",
      title: "多模态学习",
      emoji: "🔗",
      duration: "1-2 周",
      description: "CLIP、图文生成、视频理解，掌握跨模态理解与生成",
      categoryKeys: ["multimodal"],
      levels: ["入门", "进阶"],
      borderColor: "border-l-purple-500",
      bgGradient: "from-purple-500/5 to-transparent",
      dotColor: "bg-purple-500",
    },
    {
      id: "cre-llm",
      title: "LLM 创意应用",
      emoji: "✏️",
      duration: "1 周",
      description: "Prompt Engineering、LLM 创意应用开发",
      categoryKeys: ["llm"],
      levels: ["入门"],
      borderColor: "border-l-cyan-500",
      bgGradient: "from-cyan-500/5 to-transparent",
      dotColor: "bg-cyan-500",
    },
  ],
};

// 所有路线
const allRoutes: RouteConfig[] = [fastTrack, foundationRoute, securityRoute, engineerRoute, creativeRoute];

// ==================== 组件 ====================

export default function LearningPathSection() {
  const [activeRoute, setActiveRoute] = useState<string>("fast");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const route = allRoutes.find((r) => r.id === activeRoute) || fastTrack;

  const phaseArticles = useMemo(() => {
    return route.phases.map((phase) => {
      const filtered = articles.filter(
        (a) =>
          phase.categoryKeys.includes(a.category) &&
          phase.levels.includes(a.level)
      );
      const levelOrder: Record<string, number> = { 入门: 0, 进阶: 1, 高级: 2 };
      filtered.sort(
        (a, b) =>
          levelOrder[a.level] - levelOrder[b.level] ||
          b.date.localeCompare(a.date)
      );
      return { phase, articles: filtered };
    });
  }, [route]);

  const totalArticles = useMemo(() => {
    return phaseArticles.reduce((sum, p) => sum + p.articles.length, 0);
  }, [phaseArticles]);

  const toggleExpand = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            🗺️ AI 学习路线
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-5">
            根据你的目标和背景，选择最适合的学习路径
          </p>

          {/* Route Selector */}
          <div className="flex flex-wrap justify-center gap-2">
            {allRoutes.map((r) => (
              <button
                key={r.id}
                onClick={() => { setActiveRoute(r.id); setExpandedPhases(new Set()); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeRoute === r.id
                    ? `${r.activeBg} ${r.activeColor}`
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {r.emoji} {r.name}
                <span className="ml-1 text-xs text-slate-500">{r.duration}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Route Description */}
        <div className={`text-center mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10`}>
          <p className={`text-sm ${route.activeColor}`}>
            💡 {route.description} — 共 <span className="font-semibold">{totalArticles}</span> 篇推荐文章，{route.phases.length} 个阶段
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className={`absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b ${route.lineGradient}`} />

          {phaseArticles.map(({ phase, articles: phaseArts }, idx) => {
            const isExpanded = expandedPhases.has(phase.id);
            const visibleArticles = isExpanded
              ? phaseArts
              : phaseArts.slice(0, MAX_ARTICLES_DEFAULT);
            const hasMore = phaseArts.length > MAX_ARTICLES_DEFAULT;

            return (
              <div key={phase.id} className="relative pl-12 sm:pl-14 mb-6 last:mb-0">
                {/* Timeline dot */}
                <div
                  className={`absolute left-3.5 sm:left-4.5 top-6 w-3 h-3 rounded-full ${phase.dotColor} ring-4 ring-slate-900 z-10`}
                />

                {/* Arrow connector between phases */}
                {idx > 0 && (
                  <div className="absolute left-5 sm:left-6 -top-3 flex flex-col items-center">
                    <svg
                      className="w-4 h-4 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                )}

                {/* Phase card */}
                <div
                  className={`rounded-2xl bg-gradient-to-r ${phase.bgGradient} bg-white/5 backdrop-blur-md border border-white/10 border-l-4 ${phase.borderColor} p-5 sm:p-6`}
                >
                  {/* Phase header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{phase.emoji}</span>
                        <h3 className="text-lg sm:text-xl font-bold">
                          第{idx + 1}阶段：{phase.title}
                        </h3>
                      </div>
                      <p className="text-slate-400 text-sm">{phase.description}</p>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-300">
                      ⏱ {phase.duration}
                    </span>
                  </div>

                  {/* Sub paths */}
                  {phase.subPaths && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {phase.subPaths.map((sp, spIdx) => (
                        <span key={sp.label}>
                          {spIdx > 0 && (
                            <span className="text-slate-600 mx-1">→</span>
                          )}
                          <span className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-slate-300">
                            {sp.emoji} {sp.label}
                          </span>
                        </span>
                      ))}
                      <span className="text-xs text-slate-500 ml-2">
                        ({phaseArts.length} 篇文章)
                      </span>
                    </div>
                  )}

                  {/* Articles */}
                  {phaseArts.length > 0 ? (
                    <>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visibleArticles.map((article) => (
                          <ArticleCard key={article.id} article={article} />
                        ))}
                      </div>

                      {hasMore && (
                        <div className="mt-4 text-center">
                          <button
                            onClick={() => toggleExpand(phase.id)}
                            className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all"
                          >
                            {isExpanded
                              ? `收起（${phaseArts.length} 篇）`
                              : `展开全部（${phaseArts.length} 篇）`}
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-500 text-sm">
                        暂无推荐文章，敬请期待
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

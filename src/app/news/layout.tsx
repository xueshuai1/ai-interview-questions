import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 最新动态 - 每日前沿资讯',
  description: 'AI Master AI 动态频道，每日更新 10-15 条 AI 前沿资讯，覆盖 OpenAI、Anthropic、Google DeepMind、arXiv 论文、GitHub 开源项目等权威来源，保留最近 2 周完整记录。',
  keywords: ['AI 新闻', 'AI 动态', 'AI 前沿', 'AI 资讯', '大语言模型新闻', 'AI 行业动态'],
  alternates: {
    canonical: 'https://www.ai-master.cc/news',
  },
};

export default function NewsListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

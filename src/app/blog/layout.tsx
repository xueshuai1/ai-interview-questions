import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 技术博客 - 深度解读前沿热点',
  description: 'AI Master 技术博客，60+ 篇深度技术文章，紧跟 AI 前沿热点，涵盖最新论文解读、技术趋势分析、工具实战指南，每篇 5000+ 字深度分析。',
  keywords: ['AI 博客', 'AI 技术博客', 'AI 前沿', 'AI 论文解读', 'AI 趋势', '大语言模型', 'AI Agent'],
  alternates: {
    canonical: 'https://www.ai-master.cc/blog',
  },
};

export default function BlogListLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

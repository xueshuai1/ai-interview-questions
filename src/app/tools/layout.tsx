import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 工具集 - 180+ AI 工具推荐',
  description: 'AI Master 工具集，收录 180+ 精选 AI 工具，涵盖大语言模型、AI Agent、开发框架、数据处理、多模态等分类，含详细评测、优缺点对比和使用建议。',
  keywords: ['AI 工具', 'AI 工具推荐', '大语言模型工具', 'AI Agent 框架', 'AI 开发工具', 'AI 评测'],
  alternates: {
    canonical: 'https://www.ai-master.cc/tools',
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

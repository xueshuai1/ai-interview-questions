import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 知识库 - 250+ 篇系统知识文章',
  description: 'AI Master 知识库，涵盖机器学习、深度学习、大语言模型、AI Agent、RAG、强化学习、计算机视觉、自然语言处理等 14 个分类，250+ 篇系统性知识文章，从入门到精通。',
  keywords: ['AI 知识库', '机器学习教程', '深度学习', '大语言模型', 'AI Agent', 'RAG', 'Transformer', '强化学习', '计算机视觉', '自然语言处理'],
  alternates: {
    canonical: 'https://www.ai-master.cc/knowledge',
  },
};

export default function KnowledgeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

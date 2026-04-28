import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于 AI Master',
  description: 'AI Master 是专业的人工智能学习与实践平台，致力于提供高质量的 AI 知识库、技术博客、工具推荐和前沿动态，帮助开发者从入门到精通。',
  alternates: {
    canonical: 'https://www.ai-master.cc/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

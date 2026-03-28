import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// MDX 序列化选项
export const mdxOptions = {
  mdxOptions: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeHighlight],
  },
};

// 序列化 MDX 内容
export async function serializeMdx(source: string) {
  try {
    const result = await serialize(source, mdxOptions);
    return { success: true, data: result };
  } catch (error) {
    console.error("MDX serialization error:", error);
    return { success: false, error };
  }
}

// 解析 Mermaid 代码块
export function extractMermaidBlocks(content: string): string[] {
  const mermaidRegex = /```mermaid\s+([\s\S]+?)\s+```/g;
  const blocks: string[] = [];
  let match;

  while ((match = mermaidRegex.exec(content)) !== null) {
    blocks.push(match[1].trim());
  }

  return blocks;
}

// 提取代码块语言
export function extractCodeLanguages(content: string): string[] {
  const codeRegex = /```(\w+)/g;
  const languages: string[] = [];
  let match;

  while ((match = codeRegex.exec(content)) !== null) {
    if (!languages.includes(match[1])) {
      languages.push(match[1]);
    }
  }

  return languages;
}

// 计算阅读时间（分钟）
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// 提取标题
export function extractHeadings(content: string): Array<{
  level: number;
  text: string;
  id: string;
}> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string; id: string }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

    headings.push({ level, text, id });
  }

  return headings;
}

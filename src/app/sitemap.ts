import { MetadataRoute } from 'next';
import { news } from '@/data/news';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.ai-master.cc';
  
  // 固定页面
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/knowledge`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/tools`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // 知识库文章（从文件系统读取）
  const articlesDir = join(process.cwd(), 'src', 'data', 'articles');
  let articles: MetadataRoute.Sitemap = [];
  if (existsSync(articlesDir)) {
    const articleFiles = readdirSync(articlesDir).filter(f => f.endsWith('.ts'));
    articles = articleFiles.map(f => ({
      url: `${baseUrl}/article/${f.replace('.ts', '')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  }

  // 博客文章（从文件系统读取）
  const blogsDir = join(process.cwd(), 'src', 'data', 'blogs');
  let blogs: MetadataRoute.Sitemap = [];
  if (existsSync(blogsDir)) {
    const blogFiles = readdirSync(blogsDir).filter(f => f.startsWith('blog-') && f.endsWith('.ts'));
    blogs = blogFiles.map(f => ({
      url: `${baseUrl}/blog/${f.replace('.ts', '')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  }

  // 新闻页面（保留最近 2 周）
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
  const recentNews = news.filter(n => new Date(n.date.split(' ')[0]) >= twoWeeksAgo);
  const newsPages: MetadataRoute.Sitemap = recentNews.map(n => ({
    url: `${baseUrl}/news/${n.id}`,
    lastModified: new Date(n.date),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...articles, ...blogs, ...newsPages];
}

"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { news } from "@/data/news";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function NewsDetailPage({ params }: { params: { id: string } }) {
  const item = news.find((n) => n.id === params.id);
  if (!item) notFound();

  const relatedNews = news.filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="/news" />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-sm text-slate-400 hover:text-brand-300 transition-colors">
            ← 返回首页
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className={`px-3 py-1 ${item.tagColor || "bg-brand-500/10 text-brand-300"} rounded-full text-sm font-medium`}>
              {item.tag}
            </span>
            <span className="text-slate-500 text-sm">{item.date}</span>
            <span className="text-slate-500 text-sm">·</span>
            <span className="text-slate-500 text-sm">来源：{item.source}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-6 leading-tight">
            {item.title}
          </h1>

          <p className="text-lg text-slate-400 mt-4 leading-relaxed">
            {item.summary}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-invert prose-lg max-w-none">
            {item.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
                return (
                  <h2 key={i} className="text-xl font-bold text-brand-300 mt-8 mb-4">
                    {paragraph.replace(/\*\*/g, "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("- ")) {
                const items = paragraph.split("\n").filter((l) => l.startsWith("- "));
                return (
                  <ul key={i} className="space-y-2 my-4">
                    {items.map((item, j) => (
                      <li key={j} className="text-slate-300 leading-relaxed">
                        {item.replace(/^- \*\*(.*?)\*\*/g, "").replace(/\*\*/g, "$1")}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (/^\d+\./.test(paragraph)) {
                const items = paragraph.split("\n").filter((l) => /^\d+\./.test(l));
                return (
                  <ol key={i} className="space-y-2 my-4 list-decimal list-inside">
                    {items.map((item, j) => (
                      <li key={j} className="text-slate-300 leading-relaxed">
                        {item.replace(/^\d+\.\s*/, "")}
                      </li>
                    ))}
                  </ol>
                );
              }
              return (
                <p key={i} className="text-slate-300 leading-relaxed my-4">
                  {paragraph}
                </p>
              );
            })}
          </article>

          {/* Source Link */}
          <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-sm text-slate-400 mb-3">📰 原始来源</p>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 transition-colors break-all"
            >
              {item.sourceUrl}
            </a>
          </div>
        </div>
      </section>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">📰 更多动态</h2>
            <div className="space-y-4">
              {relatedNews.map((n) => (
                <Link
                  key={n.id}
                  href={n.href}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all"
                >
                  <div className="flex items-center gap-4 mb-3 sm:mb-0">
                    <span className={`px-3 py-1 ${n.tagColor || "bg-brand-500/10 text-brand-300"} rounded-full text-sm font-medium`}>
                      {n.tag}
                    </span>
                    <h3 className="text-lg font-medium group-hover:text-brand-300 transition-colors">
                      {n.title}
                    </h3>
                  </div>
                  <span className="text-slate-500 text-sm">{n.date}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-brand-950 text-white">
      <Navbar activePath="" />

      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 -mt-16">
        <div className="text-8xl mb-8">🔍</div>

        <h1 className="text-5xl sm:text-6xl font-bold mb-4">
          <span className="text-gradient">页面未找到</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-md text-center mb-10">
          抱歉，你访问的页面不存在或已被移除。<br />
          试试从下面选择一个方向继续探索吧。
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/"
            className="px-8 py-4 bg-brand-600 hover:bg-brand-500 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5"
          >
            🏠 返回首页
          </Link>
          <Link
            href="/knowledge"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition-all hover:-translate-y-0.5"
          >
            📚 知识库
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}

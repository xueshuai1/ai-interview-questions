"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { NewsItem } from "@/data/news";

/**
 * 无缝新闻滚动条
 *
 * 原理：内容 = items × 2，动画 translateX(-50%) 正好滚完一组
 * 关键：用 max-content 确保宽度 = 所有 item 之和，translateX(-50%) = 一组宽度
 */
export default function NewsTicker({ items }: { items: NewsItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState("60s");

  useEffect(() => {
    // Measure after layout is settled
    const timer = setTimeout(() => {
      if (!trackRef.current) return;
      const singleSetWidth = trackRef.current.scrollWidth / 2;
      // Speed: ~80px/s for comfortable reading
      const d = singleSetWidth / 80;
      setDuration(`${d.toFixed(1)}s`);
    }, 200);
    return () => clearTimeout(timer);
  }, [items]);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-brand-400 font-medium">🔥 最新动态</span>
        <span className="flex-1 h-px bg-white/10" />
      </div>
      <div className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/5">
        <div
          ref={trackRef}
          className="flex gap-8 py-3 px-4"
          style={{
            width: "max-content",
            animation: `ticker-scroll ${duration} linear infinite`,
          }}
        >
          {doubled.map((item, i) => (
            <Link
              key={`news-${item.id}-${i}`}
              href={item.href}
              className="flex items-center gap-2 shrink-0 group"
            >
              <span
                className={`px-2 py-0.5 ${item.tagColor || "bg-brand-500/10 text-brand-300"} rounded-full text-[10px] font-medium whitespace-nowrap`}
              >
                {item.tag}
              </span>
              <span className="text-sm text-slate-300 group-hover:text-brand-300 transition-colors whitespace-nowrap">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-slate-900/90 to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-slate-900/90 to-transparent pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}
      </style>
    </div>
  );
}

"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { NewsItem } from "@/data/news";

/**
 * 无缝新闻滚动条
 * 
 * 原理：内容 = items × 2，JS 测量单组宽度，动画滚动精确的单组像素距离
 * 在动画结束时第二组正好对齐到第一组的起始位置 → 视觉无缝循环
 */
export default function NewsTicker({ items }: { items: NewsItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const calcAnimation = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const containerWidth = track.parentElement?.offsetWidth || 800;
    // 单组宽度 = 总滚动宽度的一半（因为我们用了 items × 2）
    const singleSetWidth = track.scrollWidth / 2;

    if (singleSetWidth <= containerWidth + 20) {
      setStyle({});
      return;
    }

    // 速度：~150px/s，比之前快一些
    const speed = 150;
    const duration = singleSetWidth / speed;

    // 关键：设置精确的固定宽度，确保 translateX(-50%) = -singleSetWidth
    setStyle({
      width: `${singleSetWidth * 2}px`,
      animation: `ticker-scroll ${duration.toFixed(1)}s linear infinite`,
    });
  }, [items.length]);

  useEffect(() => {
    // 等 DOM 渲染完后测量
    const t1 = setTimeout(calcAnimation, 200);
    const t2 = setTimeout(calcAnimation, 800);
    window.addEventListener("resize", calcAnimation);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", calcAnimation);
    };
  }, [calcAnimation]);

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
          style={style}
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
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}
      </style>
    </div>
  );
}

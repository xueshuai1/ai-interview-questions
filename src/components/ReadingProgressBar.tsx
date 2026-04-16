"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setProgress(pct);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 w-full">
      {/* 进度条轨道 */}
      <div className="h-1 bg-brand-500/20 w-full">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* 百分比标签 — 移动端可见 */}
      <div className="sm:hidden fixed top-2 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-1.5 py-0.5 rounded-full opacity-80">
        {Math.round(progress)}%
      </div>
    </div>
  );
}

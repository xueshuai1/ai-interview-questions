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
    <div className="fixed top-0 left-0 z-[60] w-full">
      {/* 进度条轨道 */}
      <div className="h-1 bg-brand-500/20 w-full">
        <div
          className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

    </div>
  );
}

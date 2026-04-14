"use client";

import { useEffect, useState } from "react";

export default function ReadingProgressBar() {
  const [progress, setShow] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setShow(pct);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  if (progress < 1) return null;

  return (
    <div className="fixed top-0 left-0 z-50 h-1 bg-brand-500/30 w-full">
      <div
        className="h-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

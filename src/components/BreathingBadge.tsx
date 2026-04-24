'use client';

import { useState, useRef, useEffect } from 'react';

/**
 * 呼吸灯 Badge — 首页 "AI Master · 精通人工智能"
 * 
 * 效果：
 * - 三层呼吸光晕（内圈快、中圈标准、外圈慢），模拟真实呼吸节奏
 * - 鼠标悬停时光晕放大 + 粒子环旋转
 * - 中心圆点持续脉冲，体现「持续更新中」
 */
export default function BreathingBadge() {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    el.addEventListener('mousemove', handleMove);
    return () => el.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      ref={ref}
      className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full cursor-default overflow-visible"
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 50%, rgba(59,130,246,0.18) 100%)'
          : 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(59,130,246,0.08) 100%)',
        border: hovered ? '1px solid rgba(139,92,246,0.35)' : '1px solid rgba(99,102,241,0.2)',
        boxShadow: hovered
          ? '0 0 30px rgba(99,102,241,0.3), 0 0 60px rgba(139,92,246,0.15), inset 0 0 20px rgba(99,102,241,0.1)'
          : '0 0 20px rgba(99,102,241,0.15), 0 0 40px rgba(59,130,246,0.08)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* === 多层呼吸光晕 === */}
      {/* 外圈 — 慢呼吸 (4s) */}
      <div
        className="absolute -inset-4 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          animation: 'breathe-slow 4s ease-in-out infinite',
        }}
      />
      {/* 中圈 — 标准呼吸 (2.5s) */}
      <div
        className="absolute -inset-2 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 60%)',
          animation: 'breathe-normal 2.5s ease-in-out infinite',
        }}
      />
      {/* 内圈 — 快呼吸 (1.5s) */}
      <div
        className="absolute -inset-1 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 50%)',
          animation: 'breathe-fast 1.5s ease-in-out infinite',
        }}
      />

      {/* === 旋转光环（悬停时放大）=== */}
      <div
        className="absolute -inset-3 rounded-full pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0%, rgba(99,102,241,0.3) 10%, transparent 20%, rgba(139,92,246,0.2) 40%, transparent 50%, rgba(59,130,246,0.3) 70%, transparent 80%)',
          animation: `spin-ring ${hovered ? '3s' : '8s'} linear infinite`,
          opacity: hovered ? 0.8 : 0.3,
          transition: 'opacity 0.4s ease',
          filter: 'blur(4px)',
        }}
      />

      {/* === 中心脉冲点 === */}
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        {/* 扩散环 */}
        <span
          className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-40"
          style={{ animation: 'ping-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite' }}
        />
        {/* 核心点 */}
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{
            background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
            boxShadow: '0 0 8px rgba(129,140,248,0.8), 0 0 16px rgba(167,139,250,0.4)',
          }}
        />
      </span>

      {/* === 文字 === */}
      <span
        className="relative text-sm font-medium"
        style={{
          color: hovered ? '#e0e7ff' : '#c7d2fe',
          background: hovered
            ? 'linear-gradient(90deg, #e0e7ff, #c4b5fd, #93c5fd)'
            : 'linear-gradient(90deg, #c7d2fe, #a5b4fc)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          transition: 'all 0.4s ease',
          letterSpacing: '0.02em',
        }}
      >
        AI Master · 精通人工智能
      </span>

      {/* === CSS Keyframes === */}
      <style jsx>{`
        @keyframes breathe-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes breathe-normal {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.03); }
        }
        @keyframes breathe-fast {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.02); }
        }
        @keyframes ping-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

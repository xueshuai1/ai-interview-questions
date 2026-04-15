"use client";

import { useState, useRef, useEffect } from "react";

export interface CategoryItem {
  key: string;
  icon: string;
  label: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  activeCategory: string;
  onChange: (key: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onChange }: CategoryFilterProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const activeItem = categories.find((c) => c.key === activeCategory) || categories[0];

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const handleSelect = (key: string) => {
    onChange(key);
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger Button */}
      <button
        ref={btnRef}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
          activeCategory !== categories[0]?.key
            ? "bg-brand-600/20 text-brand-300 border border-brand-500/30"
            : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"
        }`}
      >
        <span>{activeItem.icon}</span>
        <span className="hidden sm:inline">{activeItem.label}</span>
        {activeCategory !== categories[0]?.key && (
          <span className="hidden sm:inline text-[10px] text-brand-400/60 ml-0.5">·{activeItem.count}</span>
        )}
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Backdrop (mobile) */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 rounded-2xl bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/40 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">分类筛选</span>
              <button
                onClick={() => handleSelect(categories[0]?.key)}
                className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                不限
              </button>
            </div>

            {/* Grid */}
            <div className="p-3 grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
              {categories.map((c) => {
                const isActive = activeCategory === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => handleSelect(c.key)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-brand-600/20 border border-brand-500/40 text-brand-300"
                        : "bg-white/5 border border-transparent hover:bg-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{c.icon}</span>
                    <span className="text-xs font-medium leading-tight text-center">{c.label}</span>
                    <span className={`text-[10px] ${isActive ? "text-brand-400" : "text-slate-600"}`}>
                      {c.count}
                    </span>
                    {isActive && (
                      <svg className="w-3.5 h-3.5 text-brand-400 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

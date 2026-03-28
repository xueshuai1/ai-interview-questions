"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidProps {
  code: string;
  theme?: "default" | "dark" | "neutral" | "forest";
}

export default function Mermaid({ code, theme = "default" }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const renderMermaid = async () => {
      try {
        // 动态导入 mermaid
        const mermaid = (await import("mermaid")).default;
        
        await mermaid.initialize({
          startOnLoad: false,
          theme: theme === "dark" ? "dark" : "default",
          securityLevel: "loose",
        });

        if (containerRef.current && mounted) {
          const { svg } = await mermaid.render(
            `mermaid-${Math.random().toString(36).substr(2, 9)}`,
            code
          );
          containerRef.current.innerHTML = svg;
          setLoading(false);
        }
      } catch (err) {
        console.error("Mermaid render error:", err);
        if (mounted) {
          setError("图表渲染失败，请检查语法");
          setLoading(false);
        }
      }
    };

    renderMermaid();

    return () => {
      mounted = false;
    };
  }, [code, theme]);

  if (loading) {
    return (
      <div className="my-6 p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
        <div className="animate-pulse text-gray-500">
          <span className="text-2xl">📊</span>
          <p className="mt-2 text-sm">正在渲染图表...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
        <div className="flex items-center gap-2 text-red-700">
          <span>⚠️</span>
          <span className="text-sm font-medium">{error}</span>
        </div>
        <pre className="mt-2 p-3 bg-red-100 rounded text-xs text-red-800 overflow-x-auto">
          {code}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-8 p-6 bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-x-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
        <span className="text-xl">📊</span>
        <span className="text-sm font-semibold text-gray-600">流程图</span>
      </div>
      <div ref={containerRef} className="mermaid flex justify-center" />
    </div>
  );
}

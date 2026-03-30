"use client";

import { useEffect } from 'react';
import mermaid from 'mermaid';

interface MermaidChartProps {
  chart: string;
}

export default function MermaidChart({ chart }: MermaidChartProps) {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
    
    // 重新渲染 Mermaid 图表
    mermaid.contentLoaded();
  }, [chart]);

  return (
    <div className="my-6">
      <div className="mermaid bg-white p-4 rounded-lg border border-gray-200">
        {chart}
      </div>
    </div>
  );
}

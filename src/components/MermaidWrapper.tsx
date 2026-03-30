"use client";

import { useEffect, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidWrapperProps {
  chart: string;
}

export default function MermaidWrapper({ chart }: MermaidWrapperProps) {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });

    // 渲染 Mermaid 图表
    const renderMermaid = async () => {
      try {
        const { svg } = await mermaid.render('mermaid-svg-' + Math.random().toString(36).substring(7), chart);
        setSvg(svg);
      } catch (err: any) {
        setError(err.message);
      }
    };

    renderMermaid();
  }, [chart]);

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">图表渲染失败：{error}</p>
        <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 text-center text-gray-500 py-4">
        加载图表中...
      </div>
    );
  }

  return (
    <div className="my-6" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

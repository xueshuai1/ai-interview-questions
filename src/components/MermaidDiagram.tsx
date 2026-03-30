'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  value: string;
}

export default function MermaidDiagram({ value }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        // 初始化 mermaid
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'loose',
          theme: 'default',
          fontFamily: 'inherit',
        });

        // 渲染图表
        const { svg: renderedSvg } = await mermaid.render(
          'mermaid-' + Math.random().toString(36).substring(2),
          value
        );
        
        setSvg(renderedSvg);
        setError('');
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError('图表渲染失败：' + (err as Error).message);
      }
    };

    renderDiagram();
  }, [value]);

  if (error) {
    return (
      <div className="my-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600 text-sm">{error}</p>
        <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
          <code>{value}</code>
        </pre>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="my-6 flex justify-center">
      {svg ? (
        <div dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <div className="text-gray-400">加载中...</div>
      )}
    </div>
  );
}

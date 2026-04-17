'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidChartProps {
  chart: string;
  onSvgReady?: (svg: string) => void;
}

export default function MermaidChart({ chart, onSvgReady }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function render() {
      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'system-ui, sans-serif',
        });

        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (mounted) {
          setSvg(svg);
          onSvgReady?.(svg);
        }
      } catch (e) {
        if (mounted) setError('图表渲染失败');
      }
    }

    render();
    return () => { mounted = false; };
  }, [chart]);

  if (error) {
    return <div className="text-slate-500 text-sm italic">{error}</div>;
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-chart flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

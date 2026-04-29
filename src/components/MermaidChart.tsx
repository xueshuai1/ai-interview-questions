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
          fontFamily: 'system-ui, -apple-system, sans-serif',
          suppressErrorRendering: false,
          themeVariables: {
            fontSize: '16px',
            // 统一亮色文字，确保深色背景下清晰可读
            primaryTextColor: '#f1f5f9',
            secondaryTextColor: '#f1f5f9',
            tertiaryTextColor: '#f1f5f9',
            // 节点背景加亮，与文字形成足够对比
            primaryColor: '#1e3a5f',
            primaryBorderColor: '#60a5fa',
            mainBkg: '#1e3a5f',
            secondBkg: '#1e3a5f',
            nodeBkg: '#1e3a5f',
            nodeBorder: '#60a5fa',
            lineColor: '#60a5fa',
            secondaryColor: '#1e3a5f',
            secondaryBorderColor: '#60a5fa',
            tertiaryColor: '#1e3a5f',
            tertiaryBorderColor: '#60a5fa',
            clusterBkg: '#0f172a',
            clusterBorder: '#475569',
            titleColor: '#f8fafc',
            edgeLabelBackground: '#1e293b',
            actorBorder: '#60a5fa',
            background: '#0f172a',
            textColor: '#f1f5f9',
          },
          flowchart: {
            curve: 'basis',
            padding: 20,
            nodeSpacing: 50,
            rankSpacing: 70,
            htmlLabels: true,
            useMaxWidth: false,
          },
          sequence: {
            useMaxWidth: false,
            wrap: true,
          },
          gantt: {
            useMaxWidth: false,
          },
        });

        // Generate truly unique ID (timestamp + random) to avoid SPA navigation collision
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (mounted) {
          setSvg(svg);
          onSvgReady?.(svg);
        }
      } catch (err: any) {
        // Show error message so QA can catch syntax issues
        console.error('MermaidChart render failed:', err);
        if (mounted) {
          const msg = err?.message || String(err);
          // Truncate long messages for display
          const shortMsg = msg.length > 200 ? msg.substring(0, 200) + '...' : msg;
          setError(`图表渲染失败: ${shortMsg}`);
          setSvg('');
        }
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

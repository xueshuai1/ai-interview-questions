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
          suppressErrorRendering: true,
          themeVariables: {
            fontSize: '16px',
            primaryColor: '#1e3a5f',
            primaryTextColor: '#e2e8f0',
            primaryBorderColor: '#3b82f6',
            lineColor: '#60a5fa',
            secondaryColor: '#164e63',
            secondaryTextColor: '#e0f2fe',
            secondaryBorderColor: '#22d3ee',
            tertiaryColor: '#581c87',
            tertiaryTextColor: '#f3e8ff',
            tertiaryBorderColor: '#c084fc',
            mainBkg: '#1e3a5f',
            secondBkg: '#164e63',
            nodeBkg: '#1e3a5f',
            nodeBorder: '#3b82f6',
            clusterBkg: '#0f172a',
            clusterBorder: '#334155',
            titleColor: '#f1f5f9',
            edgeLabelBackground: '#1e293b',
            actorBorder: '#60a5fa',
            background: '#0f172a',
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
      } catch (err) {
        // Silently fail — suppressErrorRendering prevents bomb icon
        console.error('MermaidChart render failed:', err);
        if (mounted) {
          setError('');
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

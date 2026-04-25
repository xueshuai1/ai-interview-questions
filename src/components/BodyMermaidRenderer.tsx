'use client';

import { useEffect } from 'react';

/**
 * Global mermaid chart renderer for body-embedded mermaid diagrams.
 * This component finds all .mermaid-container elements and renders them using mermaid.js.
 * Place once in the app layout or article page.
 */
export function BodyMermaidRenderer() {
  useEffect(() => {
    const containers = document.querySelectorAll('.mermaid-container');
    if (!containers.length) return;

    let mounted = true;

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js';
    script.onload = () => {
      if (!mounted) return;
      try {
        (window as any).mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'system-ui, sans-serif',
          suppressErrorRendering: true,
          themeVariables: {
            fontSize: '16px',
            primaryTextColor: '#f1f5f9',
            primaryColor: '#1e3a5f',
            primaryBorderColor: '#60a5fa',
            mainBkg: '#1e3a5f',
            nodeBkg: '#1e3a5f',
            nodeBorder: '#60a5fa',
            lineColor: '#60a5fa',
            clusterBkg: '#0f172a',
            clusterBorder: '#475569',
            titleColor: '#f8fafc',
            edgeLabelBackground: '#1e293b',
            background: '#0f172a',
            textColor: '#f1f5f9',
          },
        });

        Array.from(containers).forEach((el) => {
          const chartEl = el.querySelector('.mermaid-chart');
          const loadingEl = el.querySelector('.text-slate-500');
          const chart = (el as HTMLElement).dataset.mermaid;
          if (!chartEl || !chart) return;
          try {
            const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            (window as any).mermaid.render(id, chart).then((r: any) => {
              if (mounted) {
                chartEl.innerHTML = r.svg;
                if (loadingEl) loadingEl.remove();
              }
            }).catch(() => {
              if (mounted && loadingEl) loadingEl.remove();
            });
          } catch {
            if (mounted && loadingEl) loadingEl.remove();
          }
        });
      } catch {
        // mermaid init failed
      }
    };
    document.head.appendChild(script);

    return () => { mounted = false; };
  }, []);

  return null;
}

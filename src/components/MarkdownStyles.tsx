"use client";

export default function MarkdownStyles() {
  return (
    <style jsx global>{`
      /* Markdown 内容样式 - 替代 @tailwindcss/typography */
      .markdown-content {
        color: #1e293b;
        line-height: 1.75;
      }

      .markdown-content h1 {
        font-size: 2.25rem;
        font-weight: 700;
        margin-top: 2.5rem;
        margin-bottom: 1.5rem;
        line-height: 1.3;
        color: #0f172a;
      }

      .markdown-content h2 {
        font-size: 1.875rem;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 1rem;
        line-height: 1.4;
        color: #1e293b;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .markdown-content h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: #1e293b;
      }

      .markdown-content h4 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
        color: #1e293b;
      }

      .markdown-content p {
        margin-top: 1.25rem;
        margin-bottom: 1.25rem;
        line-height: 1.75;
      }

      .markdown-content a {
        color: #2563eb;
        text-decoration: none;
        transition: all 0.2s;
      }

      .markdown-content a:hover {
        color: #1d4ed8;
        text-decoration: underline;
      }

      .markdown-content strong {
        font-weight: 600;
        color: #0f172a;
      }

      .markdown-content ul,
      .markdown-content ol {
        margin-top: 1.25rem;
        margin-bottom: 1.25rem;
        padding-left: 1.5rem;
      }

      .markdown-content ul {
        list-style-type: disc;
      }

      .markdown-content ol {
        list-style-type: decimal;
      }

      .markdown-content li {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .markdown-content li > ul,
      .markdown-content li > ol {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .markdown-content blockquote {
        border-left: 4px solid #3b82f6;
        padding-left: 1rem;
        margin: 1.5rem 0;
        color: #475569;
        font-style: italic;
        background: #eff6ff;
        padding: 1rem 1.5rem;
        border-radius: 0 0.5rem 0.5rem 0;
      }

      .markdown-content blockquote p {
        margin: 0;
      }

      .markdown-content code {
        background: #f1f5f9;
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-size: 0.875em;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        color: #dc2626;
      }

      .markdown-content pre {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        padding: 1.25rem;
        margin: 1.5rem 0;
        overflow-x: auto;
      }

      .markdown-content pre code {
        background: transparent;
        padding: 0;
        color: inherit;
        font-size: 0.875rem;
        line-height: 1.6;
      }

      .markdown-content table {
        width: 100%;
        margin: 1.5rem 0;
        border-collapse: collapse;
        font-size: 0.875rem;
      }

      .markdown-content th {
        background: #f8fafc;
        font-weight: 600;
        text-align: left;
        padding: 0.75rem 1rem;
        border: 1px solid #e2e8f0;
        color: #1e293b;
      }

      .markdown-content td {
        padding: 0.75rem 1rem;
        border: 1px solid #e2e8f0;
        color: #334155;
      }

      .markdown-content tr:nth-child(even) {
        background: #f8fafc;
      }

      .markdown-content hr {
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 2rem 0;
      }

      .markdown-content img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1.5rem 0;
      }
    `}
  </style>
  );
}

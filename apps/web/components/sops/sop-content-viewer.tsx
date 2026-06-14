"use client";

import ReactMarkdown from "react-markdown";

const proseClassName =
  "prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-headings:font-medium prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-h2:text-base prose-h2:mt-6 prose-h2:mb-2 prose-h3:text-sm prose-h3:mt-4 prose-h3:mb-1.5 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5";

export function SopContentViewer({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-sm text-muted-foreground">Sin contenido.</p>;
  }

  return (
    <div className={proseClassName}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

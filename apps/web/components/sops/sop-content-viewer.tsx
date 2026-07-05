"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const proseClassName =
  "prose prose-sm dark:prose-invert max-w-none " +
  "prose-headings:text-foreground prose-headings:font-semibold " +
  "prose-h1:text-xl prose-h1:mt-6 prose-h1:mb-3 " +
  "prose-h2:text-lg prose-h2:mt-5 prose-h2:mb-2 " +
  "prose-h3:text-base prose-h3:mt-4 prose-h3:mb-1.5 " +
  "prose-p:text-foreground prose-p:leading-relaxed prose-p:my-2 " +
  "prose-li:text-foreground prose-li:my-0.5 " +
  "prose-strong:text-foreground " +
  "prose-ul:my-2 prose-ol:my-2 " +
  "prose-code:text-foreground prose-pre:my-3 " +
  "first:prose-headings:mt-0 first:prose-p:mt-0";

export function SopContentViewer({ content }: { content: string }) {
  if (!content.trim()) {
    return <p className="text-sm text-muted-foreground">Sin contenido.</p>;
  }

  return (
    <div className={proseClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

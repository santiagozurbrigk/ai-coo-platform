"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  extractAttachmentIds,
  resolveAttachmentMarkers,
} from "@/lib/sops/attachment-markers";
import { resolveSopAttachmentUrlsAction } from "@/app/sops/video-actions";

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
  /**
   * ⭐ D · S3 — Las capturas se guardan como `sop-attachment:<id>` y se resuelven
   * a URL firmada **acá, al mostrar**. Si el markdown guardara la URL, el SOP se
   * vería bien hoy y roto la semana que viene, cuando la firma venza.
   */
  const [resolved, setResolved] = useState(content);

  useEffect(() => {
    const ids = extractAttachmentIds(content);
    if (ids.length === 0) {
      setResolved(content);
      return;
    }

    let alive = true;
    void resolveSopAttachmentUrlsAction(ids).then((urls) => {
      if (alive) setResolved(resolveAttachmentMarkers(content, urls));
    });
    return () => {
      alive = false;
    };
  }, [content]);

  if (!content.trim()) {
    return <p className="text-sm text-muted-foreground">Sin contenido.</p>;
  }

  return (
    <div className={proseClassName}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{resolved}</ReactMarkdown>
    </div>
  );
}

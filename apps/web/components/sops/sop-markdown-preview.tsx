"use client";

import type { ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-medium text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function SopMarkdownPreview({ content }: { content: string }) {
  const lines = content.split("\n");
  const nodes: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length === 0) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="ml-4 list-disc space-y-1">
        {listItems.map((item, i) => (
          <li key={i} className="text-sm leading-relaxed text-muted-foreground">
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    // D · S3 — Una línea que es sólo una imagen se dibuja como imagen. Antes el
    // markdown de una captura se mostraba como texto crudo.
    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(trimmed);
    if (image) {
      flushList();
      const [, alt, src] = image;
      // Un marcador sin resolver no es una URL: se muestra el aviso en vez de
      // una imagen rota.
      nodes.push(
        src?.startsWith("sop-attachment:") ? (
          <p
            key={`missing-${i}`}
            className="rounded-lg border border-warning/40 px-3 py-2 text-xs text-warning"
          >
            Captura no disponible{alt ? `: ${alt}` : ""}
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`img-${i}`}
            src={src}
            alt={alt ?? ""}
            className="my-2 max-w-full rounded-lg border border-border"
          />
        )
      );
      continue;
    }

    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      nodes.push(
        <h3
          key={`h2-${i}`}
          className="mt-4 first:mt-0 text-sm font-semibold text-foreground"
        >
          {trimmed.slice(3)}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      nodes.push(
        <h4
          key={`h3-${i}`}
          className="mt-3 text-sm font-medium text-brand-700 dark:text-brand-300/90"
        >
          {trimmed.slice(4)}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      continue;
    }

    flushList();
    nodes.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-muted-foreground">
        {renderInline(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-2">{nodes}</div>;
}

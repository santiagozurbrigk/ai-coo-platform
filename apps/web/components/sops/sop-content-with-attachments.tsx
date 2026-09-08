"use client";

/**
 * D · S3 — Muestra un SOP resolviendo los marcadores de captura.
 *
 * El markdown guardado tiene `sop-attachment:<id>`; acá se cambian por URLs
 * firmadas **en el momento de mostrar**. Por eso el documento no envejece: las
 * firmas vencen, el marcador no.
 */

import { useEffect, useState } from "react";
import {
  extractAttachmentIds,
  resolveAttachmentMarkers,
} from "@/lib/sops/attachment-markers";
import { resolveSopAttachmentUrlsAction } from "@/app/sops/video-actions";
import { SopMarkdownPreview } from "@/components/sops/sop-markdown-preview";

export function SopContentWithAttachments({ content }: { content: string }) {
  const [resolved, setResolved] = useState(content);

  useEffect(() => {
    const ids = extractAttachmentIds(content);
    if (ids.length === 0) {
      setResolved(content);
      return;
    }

    let alive = true;
    resolveSopAttachmentUrlsAction(ids).then((urls) => {
      if (alive) setResolved(resolveAttachmentMarkers(content, urls));
    });
    return () => {
      alive = false;
    };
  }, [content]);

  return <SopMarkdownPreview content={resolved} />;
}

"use client";

import { useState } from "react";
import { Copy, Info } from "lucide-react";
import { Button, cn } from "@ai-coo/ui";

const EXAMPLE_JSON = `{
  "subscriber_id": "{{user_id}}",
  "first_name": "{{first_name}}",
  "last_name": "{{last_name}}",
  "message": "{{last_input_text}}"
}`;

type ManyChatWebhookNoticeProps = {
  webhookUrl: string;
  className?: string;
};

export function ManyChatWebhookNotice({
  webhookUrl,
  className,
}: ManyChatWebhookNoticeProps) {
  const [copied, setCopied] = useState<"url" | "json" | null>(null);

  async function copy(text: string, kind: "url" | "json") {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-50/95",
        className
      )}
    >
      <div className="flex gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" aria-hidden />
        <div className="min-w-0 space-y-2">
          <p className="font-medium text-sky-50">Configura External Request en ManyChat</p>
          <p className="text-xs leading-relaxed text-sky-100/90">
            En tu flujo (p. ej. Default Reply), añade una acción{" "}
            <strong className="font-semibold">External Request → POST</strong> con esta URL.
            Activa <strong className="font-semibold">Encode to JSON</strong> si el mensaje
            incluye URLs o caracteres especiales.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <code className="max-w-full truncate rounded bg-black/20 px-2 py-1 text-[11px]">
              {webhookUrl}
            </code>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-xs"
              onClick={() => copy(webhookUrl, "url")}
            >
              <Copy className="h-3 w-3" />
              {copied === "url" ? "Copiado" : "Copiar URL"}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded bg-black/25 p-2 text-[10px] leading-relaxed">
            {EXAMPLE_JSON}
          </pre>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs"
            onClick={() => copy(EXAMPLE_JSON, "json")}
          >
            <Copy className="h-3 w-3" />
            {copied === "json" ? "Copiado" : "Copiar JSON de ejemplo"}
          </Button>
        </div>
      </div>
    </div>
  );
}

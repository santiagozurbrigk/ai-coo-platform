import { ExternalLink, Video } from "lucide-react";
import { formatDate } from "@/lib/format";
import { extractTranscriptPreview } from "@/lib/fathom/transcript-preview";
import type { FathomKnowledgeCall } from "@/types/business-context";

export function FathomContextCallCard({ call }: { call: FathomKnowledgeCall }) {
  const preview = call.transcript
    ? extractTranscriptPreview(call.transcript)
    : null;

  return (
    <div className="rounded-xl border border-white/08 bg-white/03 p-4 transition-colors hover:bg-white/05">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/15">
            <Video className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{call.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {call.call_date ? formatDate(call.call_date) : "Sin fecha"}
              {call.duration_seconds ? (
                <span> · {Math.round(call.duration_seconds / 60)} min</span>
              ) : null}
            </p>
          </div>
        </div>

        {call.fathom_url ? (
          <a
            href={call.fathom_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-shrink-0 items-center gap-1 text-xs text-violet-400 transition-colors hover:text-violet-300"
          >
            Ver en Fathom
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>

      {preview ? (
        <div className="mt-3 border-t border-white/06 pt-3">
          <p className="line-clamp-2 text-[11px] text-muted-foreground">
            {preview}
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-full border border-white/06 bg-white/05 px-2 py-0.5 text-[10px] text-white/40">
          Contexto de negocio
        </span>
        {call.status === "pending" ? (
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
            Pendiente de procesar
          </span>
        ) : null}
      </div>
    </div>
  );
}

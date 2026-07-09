import { ExternalLink, Users } from "lucide-react";
import { formatDate } from "@/lib/format";
import { extractTranscriptPreview } from "@/lib/fathom/transcript-preview";
import { FathomCallDetail } from "@/components/fathom/fathom-call-detail";
import type { FathomKnowledgeCall } from "@/types/business-context";

export function FathomClientCallCard({ call }: { call: FathomKnowledgeCall }) {
  const preview = call.transcript
    ? extractTranscriptPreview(call.transcript)
    : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{call.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {call.clientName ? `${call.clientName} · ` : ""}
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
            className="flex flex-shrink-0 items-center gap-1 text-xs text-primary transition-colors hover:underline"
          >
            Ver en Fathom
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>

      {preview ? (
        <div className="mt-3 border-t border-border pt-3">
          <p className="line-clamp-2 text-[11px] text-muted-foreground">
            {preview}
          </p>
        </div>
      ) : null}

      <div className="mt-3">
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
          Reunión con cliente
        </span>
      </div>

      <FathomCallDetail call={call} />
    </div>
  );
}

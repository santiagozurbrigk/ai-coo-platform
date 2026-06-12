"use client";

import { X } from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { UTMLeadCaptureRow, UTMLinkRow } from "@/types/utm";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UTMLeadsSheet({
  open,
  onOpenChange,
  link,
  leads,
  loading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: UTMLinkRow | null;
  leads: UTMLeadCaptureRow[];
  loading?: boolean;
}) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-black/50"
          aria-label="Cerrar panel de leads"
          onClick={() => onOpenChange(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border/40 bg-background p-6 shadow-xl backdrop-blur-xl transition-transform duration-200 dark:border-glass dark:bg-[#111111]/80",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-medium text-foreground">
              Leads del UTM
            </h2>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {link?.youtube_video_title ?? link?.utm_campaign ?? "—"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando leads…</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay leads capturados para este UTM.
          </p>
        ) : (
          <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5 dark:border-glass dark:bg-glass dark:backdrop-blur-md"
              >
                <p className="text-sm font-medium text-foreground">
                  {lead.lead_email ?? lead.lead_identifier ?? "Lead anónimo"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(lead.captured_at)}
                  {lead.utm_content ? ` · ${lead.utm_content}` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {lead.converted_to_conversation ? (
                    <span className="rounded-full bg-violet-900/20 px-2 py-0.5 text-[10px] text-violet-400">
                      Conversación
                    </span>
                  ) : null}
                  {lead.converted_to_booking ? (
                    <span className="rounded-full bg-emerald-900/20 px-2 py-0.5 text-[10px] text-emerald-400">
                      Booking
                    </span>
                  ) : null}
                  {lead.converted_to_sale ? (
                    <span className="rounded-full bg-emerald-900/20 px-2 py-0.5 text-[10px] text-emerald-400">
                      Venta
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </>
  );
}

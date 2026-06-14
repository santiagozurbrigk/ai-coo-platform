"use client";

import { useState } from "react";
import { History, Loader2, X } from "lucide-react";
import { Badge, Button, cn } from "@ai-coo/ui";
import {
  getSOPVersionsAction,
  type SopVersionView,
} from "@/app/sops/actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SopVersionsSheet({
  sopId,
  sopTitle,
  open,
  onOpenChange,
}: {
  sopId: string;
  sopTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [versions, setVersions] = useState<SopVersionView[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVersions = async () => {
    setLoading(true);
    setError(null);
    const result = await getSOPVersionsAction(sopId);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setVersions(result.data);
  };

  const handleOpen = () => {
    onOpenChange(true);
    if (versions === null) void loadVersions();
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-[10px] text-muted-foreground"
        onClick={handleOpen}
      >
        <History className="mr-1 h-3 w-3" />
        Versiones
      </Button>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-black/50"
          aria-label="Cerrar historial"
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
          <div>
            <h2 className="text-base font-medium">Historial de versiones</h2>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {sopTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto text-sm">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : versions?.length ? (
            versions.map((v) => (
              <div
                key={v.id}
                className="rounded-lg border border-border/40 p-3 dark:border-white/[0.08]"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    v{v.version}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDate(v.created_at)}
                  </span>
                </div>
                {v.changed_by_name ? (
                  <p className="text-xs text-muted-foreground">
                    Por {v.changed_by_name}
                  </p>
                ) : null}
                {v.change_note ? (
                  <p className="mt-1 text-xs text-muted-foreground">{v.change_note}</p>
                ) : null}
                <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">
                  {v.content}
                </p>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin versiones registradas aún.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}

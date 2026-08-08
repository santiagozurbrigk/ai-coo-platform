import { getContentPiecesAction } from "@/app/marketing/content/actions";
import { maybeSyncZernioContentAction } from "@/app/marketing/content/sync-actions";
import { ContentPieceGrid } from "@/components/marketing/content-piece-grid";
import { RefreshCw } from "lucide-react";

export default async function MarketingContentPage() {
  let syncedAt: Date | null = null;
  try {
    await maybeSyncZernioContentAction();
    syncedAt = new Date();
  } catch {
    // No bloquear la página si Zernio falla
  }

  const pieces = await getContentPiecesAction({ limit: 50 });

  const reelCount = pieces.filter((p) => p.type === "reel").length;
  const analyzedCount = pieces.filter((p) => p.analysis).length;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contenido</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {pieces.length} {pieces.length === 1 ? "pieza" : "piezas"}
              {reelCount > 0 ? ` · ${reelCount} reels` : ""}
            </span>
            {analyzedCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                {analyzedCount} analizadas con IA
              </span>
            ) : null}
            {syncedAt ? (
              <span className="inline-flex items-center gap-1 text-[11px]">
                <RefreshCw className="h-3 w-3" aria-hidden />
                Sincronizado{" "}
                {syncedAt.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <ContentPieceGrid pieces={pieces} />
    </div>
  );
}

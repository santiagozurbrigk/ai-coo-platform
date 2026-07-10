import { getContentPiecesAction } from "@/app/marketing/content/actions";
import { maybeSyncZernioContentAction } from "@/app/marketing/content/sync-actions";
import { ContentPieceGrid } from "@/components/marketing/content-piece-grid";

export default async function MarketingContentPage() {
  try {
    await maybeSyncZernioContentAction();
  } catch {
    // No bloquear la página si Zernio falla
  }

  const pieces = await getContentPiecesAction({ limit: 50 });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Contenido</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pieces.length} piezas · sincronizado desde Instagram
          </p>
        </div>
      </div>
      <ContentPieceGrid pieces={pieces} />
    </div>
  );
}

import { getContentPiecesAction } from "@/app/marketing/content/actions";
import { maybeSyncZernioContentAction } from "@/app/marketing/content/sync-actions";

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
        <h1 className="text-2xl font-semibold">Contenido</h1>
      </div>
      {/* ContentPieceGrid se implementa en Prompt #12 */}
      <pre>
        {JSON.stringify(
          pieces.map((piece) => ({
            id: piece.id,
            type: piece.type,
            title: piece.title,
          })),
          null,
          2
        )}
      </pre>
    </div>
  );
}

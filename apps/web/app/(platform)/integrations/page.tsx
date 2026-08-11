import { Suspense } from "react";
import { listIntegrationsAction } from "@/app/integrations/actions";
import { getReelMusicPathAction } from "@/app/marketing/content/reel-music-actions";
import { IntegrationGrid } from "@/components/integrations";
import { ReelMusicUpload } from "@/components/marketing/trial-reels/reel-music-upload";
import { PageHeader } from "@/components/shared/page-header";

export default async function IntegrationsPage() {
  const [integrations, reelMusicPath] = await Promise.all([
    listIntegrationsAction(),
    getReelMusicPathAction(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader description="Conecta herramientas externas para sincronizar ventas, closing y marketing" />

      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <IntegrationGrid integrations={integrations} />
      </Suspense>

      {/* Trial Reels — configuración de assets */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Trial Reels</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Assets de producción para las variantes de video
          </p>
        </div>
        <ReelMusicUpload currentPath={reelMusicPath} />
      </section>
    </div>
  );
}

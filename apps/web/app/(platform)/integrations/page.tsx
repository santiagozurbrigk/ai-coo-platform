import Link from "next/link";
import { Suspense } from "react";
import { listIntegrationsAction } from "@/app/integrations/actions";
import { getPaymentIntegrationsStatusAction } from "@/app/payments/actions";
import { getReelMusicPathAction } from "@/app/marketing/content/reel-music-actions";
import { IntegrationGrid } from "@/components/integrations";
import { PaymentsConnectPanel } from "@/components/integrations/payments-connect-panel";
import { GHLOpportunitiesPanel } from "@/components/integrations/ghl-opportunities-panel";
import { getGHLOpportunitiesStatusAction } from "@/app/ghl/opportunity-actions";
import { VTurbConnectPanel } from "@/components/integrations/vturb-connect-panel";
import { getVTurbStatusAction } from "@/app/vturb/actions";
import { ReelMusicUpload } from "@/components/marketing/trial-reels/reel-music-upload";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@ai-coo/ui";
import { Upload } from "lucide-react";
import { paths } from "@/routes";

export default async function IntegrationsPage() {
  const [integrations, reelMusicPath, paymentIntegrations, ghlOpportunities, vturb] =
    await Promise.all([
      listIntegrationsAction(),
      getReelMusicPathAction(),
      getPaymentIntegrationsStatusAction(),
      getGHLOpportunitiesStatusAction(),
      getVTurbStatusAction(),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 min-w-0">
        <PageHeader className="min-w-0" description="Conecta herramientas externas para sincronizar ventas, closing y marketing" />
        <Button asChild variant="outline" size="sm" className="flex-shrink-0 mt-1">
          <Link href={paths.platform.integrationsImport}>
            <Upload className="h-4 w-4 mr-2" />
            Importar datos históricos
          </Link>
        </Button>
      </div>

      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <IntegrationGrid integrations={integrations} />
      </Suspense>

      <PaymentsConnectPanel integrations={paymentIntegrations} />

      <GHLOpportunitiesPanel status={ghlOpportunities} />

      <VTurbConnectPanel status={vturb} />

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

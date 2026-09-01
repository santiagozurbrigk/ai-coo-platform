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
import { WebinarJamConnectPanel } from "@/components/integrations/webinarjam-connect-panel";
import {
  getWebinarJamStatusAction,
  listWebinarJamWebinarOptionsAction,
} from "@/app/webinarjam/actions";
import { HyrosConnectPanel } from "@/components/integrations/hyros-connect-panel";
import { getHyrosStatusAction } from "@/app/hyros/actions";
import { UnlinkedRecordingsPanel } from "@/components/integrations/unlinked-recordings-panel";
import { listUnlinkedRecordingsAction } from "@/app/fathom/sales-call-actions";
import { ReelMusicUpload } from "@/components/marketing/trial-reels/reel-music-upload";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@ai-coo/ui";
import { Upload } from "lucide-react";
import { paths } from "@/routes";

export default async function IntegrationsPage() {
  const [
    integrations,
    reelMusicPath,
    paymentIntegrations,
    ghlOpportunities,
    vturb,
    webinarJam,
    webinarJamWebinars,
    hyros,
    unlinkedRecordings,
  ] = await Promise.all([
    listIntegrationsAction(),
    getReelMusicPathAction(),
    getPaymentIntegrationsStatusAction(),
    getGHLOpportunitiesStatusAction(),
    getVTurbStatusAction(),
    getWebinarJamStatusAction(),
    listWebinarJamWebinarOptionsAction(),
    getHyrosStatusAction(),
    listUnlinkedRecordingsAction(),
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

      <WebinarJamConnectPanel status={webinarJam} webinars={webinarJamWebinars} />

      <HyrosConnectPanel status={hyros} />

      {/* Llamadas de venta — Fase 1 del módulo de llamadas */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Llamadas de venta</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Una grabación de Fathom es una llamada de venta cuando el mail de un
            participante coincide con el de un turno agendado y el horario
            corresponde
          </p>
        </div>
        <UnlinkedRecordingsPanel recordings={unlinkedRecordings} />
      </section>

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

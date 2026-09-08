import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Button } from "@ai-coo/ui";
import { Upload } from "lucide-react";
import { getIntegrationsOverviewAction } from "@/app/integrations/actions";
import { getPaymentIntegrationsStatusAction } from "@/app/payments/actions";
import { getGHLOpportunitiesStatusAction } from "@/app/ghl/opportunity-actions";
import { getVTurbStatusAction } from "@/app/vturb/actions";
import {
  getWebinarJamStatusAction,
  listWebinarJamWebinarOptionsAction,
} from "@/app/webinarjam/actions";
import { getHyrosStatusAction } from "@/app/hyros/actions";
import { listUnlinkedRecordingsAction } from "@/app/fathom/sales-call-actions";
import { getCurrentUserIdAction } from "@/app/auth/current-user-actions";
import { getReelMusicPathAction } from "@/app/marketing/content/reel-music-actions";
import { IntegrationsBoard } from "@/components/integrations";
import { VTurbSettings } from "@/components/integrations/settings/vturb-settings";
import { HyrosSettings } from "@/components/integrations/settings/hyros-settings";
import { WebinarJamSettings } from "@/components/integrations/settings/webinarjam-settings";
import { GHLOpportunitiesSettings } from "@/components/integrations/settings/ghl-opportunities-settings";
import { PaymentSettings } from "@/components/integrations/settings/payment-settings";
import { FathomSettings } from "@/components/integrations/settings/fathom-settings";
import { ReelMusicUpload } from "@/components/marketing/trial-reels/reel-music-upload";
import { PageHeader } from "@/components/shared/page-header";
import type { IntegrationProvider } from "@/constants/integrations";
import { paths } from "@/routes";

/**
 * Integraciones.
 *
 * La página arma el panorama —una acción, un contrato para las catorce— y la
 * configuración propia de cada proveedor, que se renderiza en el servidor y baja
 * al tablero como props. El tablero decide cuál mostrar según lo que el usuario
 * abra: no hay más paneles apilados que se cargan siempre y se leen nunca.
 */
export default async function IntegrationsPage() {
  const [
    overview,
    paymentIntegrations,
    ghlOpportunities,
    vturb,
    webinarJam,
    webinarJamWebinars,
    hyros,
    unlinkedRecordings,
    currentUserId,
    reelMusicPath,
  ] = await Promise.all([
    getIntegrationsOverviewAction(),
    getPaymentIntegrationsStatusAction(),
    getGHLOpportunitiesStatusAction(),
    getVTurbStatusAction(),
    getWebinarJamStatusAction(),
    listWebinarJamWebinarOptionsAction(),
    getHyrosStatusAction(),
    listUnlinkedRecordingsAction(),
    getCurrentUserIdAction(),
    getReelMusicPathAction(),
  ]);

  const stateOf = (provider: IntegrationProvider) =>
    overview.healths.find((health) => health.provider === provider)?.state ??
    "not_connected";

  // La configuración se monta sólo cuando hay algo que configurar. GHL y Fathom
  // no renderizan nada útil sin conexión, y una tarjeta de "Configuración" vacía
  // es peor que no mostrar la sección.
  const settings: Partial<Record<IntegrationProvider, ReactNode>> = {
    vturb: <VTurbSettings status={vturb} />,
    hyros: <HyrosSettings status={hyros} />,
    webinarjam: (
      <WebinarJamSettings status={webinarJam} webinars={webinarJamWebinars} />
    ),
  };

  if (ghlOpportunities.connected) {
    settings.ghl = <GHLOpportunitiesSettings status={ghlOpportunities} />;
  }

  if (stateOf("fathom") !== "not_connected") {
    settings.fathom = (
      <FathomSettings
        currentUserId={currentUserId}
        unlinkedRecordings={unlinkedRecordings}
      />
    );
  }

  for (const integration of paymentIntegrations) {
    settings[integration.provider] = (
      <PaymentSettings integration={integration} />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <PageHeader
          className="min-w-0"
          description="Todo lo que OTC lee de afuera: qué está conectado, qué está trayendo datos y qué necesita atención"
        />
        <Button
          asChild
          variant="outline"
          size="sm"
          className="mt-1 flex-shrink-0"
        >
          <Link href={paths.platform.integrationsImport}>
            <Upload className="mr-2 h-4 w-4" />
            Importar datos históricos
          </Link>
        </Button>
      </div>

      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}
      >
        <IntegrationsBoard
          healths={overview.healths}
          summary={overview.summary}
          settings={settings}
        />
      </Suspense>

      {/*
        No es una integración: son los assets de producción de las variantes de
        video. Queda acá porque no tiene todavía otra pantalla donde vivir, pero
        separado del tablero para no volver a mezclar dos cosas distintas.
      */}
      <section className="space-y-3 border-t border-border/60 pt-8">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trial Reels
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground/70">
            Assets de producción para las variantes de video. No es una
            integración externa.
          </p>
        </div>
        <ReelMusicUpload currentPath={reelMusicPath} />
      </section>
    </div>
  );
}

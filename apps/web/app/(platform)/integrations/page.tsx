import { Suspense } from "react";
import { listIntegrationsAction } from "@/app/integrations/actions";
import { IntegrationGrid } from "@/components/integrations";
import { PageHeader } from "@/components/shared/page-header";

export default async function IntegrationsPage() {
  const integrations = await listIntegrationsAction();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Integraciones"
        description="Conecta herramientas externas para sincronizar ventas, closing y marketing"
      />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
        <IntegrationGrid integrations={integrations} />
      </Suspense>
    </div>
  );
}

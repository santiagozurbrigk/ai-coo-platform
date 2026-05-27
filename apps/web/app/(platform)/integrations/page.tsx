import { Suspense } from "react";
import { IntegrationGrid } from "@/components/integrations";
import { mockIntegrations } from "@/mocks";

export default function IntegrationsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
      <IntegrationGrid integrations={mockIntegrations} />
    </Suspense>
  );
}

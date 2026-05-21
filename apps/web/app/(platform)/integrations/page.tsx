import { IntegrationGrid } from "@/components/integrations";
import { mockIntegrations } from "@/mocks";

export default function IntegrationsPage() {
  return <IntegrationGrid integrations={mockIntegrations} />;
}

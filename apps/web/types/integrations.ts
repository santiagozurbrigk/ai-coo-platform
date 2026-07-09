import type { IntegrationStatus } from "@ai-coo/types";
import type { IntegrationProvider } from "@/constants/integrations";

export type Integration = {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  lastSync?: string;
  recordsSynced?: number;
  /** Phase 2 — sin flujo de conexión en Phase 1 */
  comingSoon?: boolean;
  /** Oculto en el grid hasta tener flujo real de conexión */
  hidden?: boolean;
  description?: string;
};

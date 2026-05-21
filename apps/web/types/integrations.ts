import type { IntegrationStatus } from "@ai-coo/types";
import type { IntegrationProvider } from "@/constants/integrations";

export type Integration = {
  id: string;
  provider: IntegrationProvider;
  name: string;
  status: IntegrationStatus;
  lastSync?: string;
  recordsSynced?: number;
};

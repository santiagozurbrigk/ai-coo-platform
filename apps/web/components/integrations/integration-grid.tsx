import type { Integration } from "@/types/integrations";
import { IntegrationCard } from "./integration-card";

export function IntegrationGrid({ integrations }: { integrations: Integration[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {integrations.map((int) => (
        <IntegrationCard key={int.id} integration={int} />
      ))}
    </div>
  );
}

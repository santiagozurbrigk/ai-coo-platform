import { FlowCta } from "@/components/shared/flow-cta";
import { Panel } from "@/components/shared";
import { es } from "@/lib/locale/es";
import { flowLinks } from "@/lib/navigation/flow-links";
import { mockOpportunities } from "@/mocks";

export default function IntelligenceOpportunitiesPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {mockOpportunities.map((o) => (
        <Panel key={o.id}>
          <p className="font-medium text-sm">{o.title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{o.potential}</p>
          <FlowCta
            href={flowLinks.opportunity(o.id)}
            label={es.common.takeAction}
          />
        </Panel>
      ))}
    </div>
  );
}

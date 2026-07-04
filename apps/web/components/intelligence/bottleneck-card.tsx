import { FlowCta } from "@/components/shared/flow-cta";
import { es } from "@/lib/locale/es";
import { resolveBottleneckLink } from "@/lib/navigation/resolve-flow-link";
import { Panel } from "@/components/shared/panel";
import type { IntelligenceBottleneck } from "@/types/intelligence";

export function BottleneckCard({ item }: { item: IntelligenceBottleneck }) {
  return (
    <Panel>
      <p className="font-medium text-sm">{item.area}</p>
      <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground">Impacto</dt>
          <dd>{item.impact}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Frecuencia</dt>
          <dd>{item.frequency}</dd>
        </div>
      </dl>
      <FlowCta
        href={resolveBottleneckLink(item)}
        label={es.common.takeAction}
      />
    </Panel>
  );
}

import Link from "next/link";
import { Badge } from "@ai-coo/ui";
import { paths } from "@/routes";
import type { LeadJourney } from "@/types/marketing-insights";
import { Panel } from "@/components/shared/panel";

const BOOKING_LABEL = {
  booked: { label: "Agendado", variant: "success" as const },
  pending: { label: "Pendiente", variant: "warning" as const },
  none: { label: "Sin agendar", variant: "secondary" as const },
};

const SALE_LABEL = {
  won: { label: "Venta", variant: "success" as const },
  lost: { label: "Perdida", variant: "destructive" as const },
  pending: { label: "En curso", variant: "warning" as const },
  none: { label: "—", variant: "secondary" as const },
};

export function LeadJourneysList({ journeys }: { journeys: LeadJourney[] }) {
  return (
    <Panel title="Recorridos de compradores">
      <ul className="divide-y divide-border">
        {journeys.map((j) => (
          <li key={j.id}>
            <Link
              href={paths.platform.sales.marketingInsights.journeyDetail(j.id)}
              className="flex flex-wrap items-center justify-between gap-3 py-4 transition-colors hover:bg-muted/20 -mx-2 px-2 rounded-md"
            >
              <div>
                <p className="font-medium">{j.leadName}</p>
                <p className="text-2xs text-muted-foreground mt-0.5">
                  {j.steps.length} pasos en el recorrido
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={BOOKING_LABEL[j.bookingStatus].variant}>
                  {BOOKING_LABEL[j.bookingStatus].label}
                </Badge>
                <Badge variant={SALE_LABEL[j.saleStatus].variant}>
                  {SALE_LABEL[j.saleStatus].label}
                </Badge>
                {j.revenue && (
                  <span className="text-sm font-semibold text-success">{j.revenue}</span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

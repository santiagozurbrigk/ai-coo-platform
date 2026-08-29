import Link from "next/link";
import { Filter } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { FunnelCreateForm } from "@/components/funnels/funnel-create-form";
import {
  listFunnelInstancesAction,
  listFunnelTemplatesAction,
} from "@/app/funnels/actions";
import { getFunnelTemplate } from "@/lib/funnels";
import { paths } from "@/routes/paths";

/**
 * Índice de embudos.
 *
 * Es un índice real y no un redirect al último usado: un redirect hace que el
 * mismo click lleve a lugares distintos según el día (docs/FUNNELS_ARCHITECTURE.md §6).
 */
export default async function FunnelsPage() {
  const [instances, templates] = await Promise.all([
    listFunnelInstancesAction(),
    listFunnelTemplatesAction(),
  ]);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Embudos"
        description="Cada embudo se mide con las mismas siete etapas, así que los mismos números significan lo mismo en cualquier oferta."
      />

      {instances.length === 0 ? (
        <EmptyState
          variant="inline"
          icon={<Filter className="h-5 w-5" />}
          title="Todavía no hay embudos"
          description="Creá el primero eligiendo un tipo. El embudo DM es el único que se puede medir end-to-end con las integraciones actuales."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {instances.map((instance) => {
            const template = getFunnelTemplate(instance.template_id);
            return (
              <Link
                key={instance.id}
                href={paths.platform.funnels.detail(instance.id)}
                className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 dark:border-glass dark:bg-glass"
              >
                <p className="text-sm font-medium">{instance.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {template?.label ?? instance.template_id}
                </p>
                <p className="mt-3 text-xs text-muted-foreground tabular-nums">
                  {new Intl.NumberFormat("es-AR", {
                    style: "currency",
                    currency: instance.currency,
                    maximumFractionDigits: 0,
                  }).format(Number(instance.price_point))}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Crear un embudo</h3>
        <FunnelCreateForm templates={templates} />
      </div>
    </div>
  );
}

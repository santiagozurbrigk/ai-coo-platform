import Link from "next/link";
import { Plug } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { paths } from "@/routes";

export function DashboardEmptyState() {
  return (
    <EmptyState
      icon={<Plug className="h-7 w-7" />}
      title="Conectá tus primeras integraciones"
      description="El panel general se llena automáticamente cuando conectás ManyChat, Calendly y Fathom. Empezá por Integraciones para ver métricas reales."
      action={
        <Button asChild>
          <Link href={paths.platform.integrations}>Ir a Integraciones</Link>
        </Button>
      }
    />
  );
}

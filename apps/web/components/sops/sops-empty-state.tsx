import { FilePlus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function SopsEmptyState() {
  return (
    <EmptyState
      icon={<FilePlus className="h-7 w-7" />}
      title="Todavía no tenés SOPs. Creá el primero."
      description="Los SOPs estandarizan cómo opera tu equipo. Usá el creador con IA para generar el primero en minutos."
    />
  );
}

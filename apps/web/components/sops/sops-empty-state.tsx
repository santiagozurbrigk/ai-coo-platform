import Link from "next/link";
import { FilePlus } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { paths } from "@/routes";

export function SopsEmptyState() {
  return (
    <EmptyState
      icon={<FilePlus className="h-7 w-7" />}
      title="Todavía no tenés SOPs. Creá el primero."
      description="Los SOPs estandarizan cómo opera tu equipo. Usá el creador con IA para generar el primero en minutos."
      action={
        <Button asChild>
          <Link href={`${paths.platform.operations.sops}#crear`}>
            Crear SOP
          </Link>
        </Button>
      }
    />
  );
}

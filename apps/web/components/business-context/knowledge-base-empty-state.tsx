import Link from "next/link";
import { Video } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { paths } from "@/routes";

export function KnowledgeBaseEmptyState() {
  return (
    <EmptyState
      icon={<Video className="h-7 w-7" />}
      title="Conectá Fathom para importar tus calls"
      description="Las transcripciones de tus reuniones se indexan automáticamente para la IA y los reportes ejecutivos."
      action={
        <Button asChild>
          <Link href={paths.platform.integrations}>Ir a Integraciones</Link>
        </Button>
      }
    />
  );
}

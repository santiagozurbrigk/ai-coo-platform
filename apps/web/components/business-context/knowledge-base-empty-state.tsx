import { BookOpen } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function KnowledgeBaseEmptyState() {
  return (
    <EmptyState
      icon={<BookOpen className="h-7 w-7" />}
      title="Tu base de conocimiento está vacía"
      description="Subí un PDF, escribí una nota o conectá Fathom en Integraciones. Todo el contenido se indexa automáticamente para que la IA lo use como contexto."
    />
  );
}

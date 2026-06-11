import { Calendar } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

export function WeeklyInputsEmptyState() {
  return (
    <EmptyState
      icon={<Calendar className="h-7 w-7" />}
      title="Enviá tus primeros inputs semanales"
      description="Completá el formulario de arriba para que la IA genere reportes ejecutivos con contexto real de cada departamento."
    />
  );
}

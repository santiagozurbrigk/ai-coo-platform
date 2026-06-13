import { DB_TO_UI_DEPARTMENT } from "@/lib/operations/weekly-utils";
import type { TeamInput, WeeklyInputRow } from "@/types/operations";

export function mapWeeklyInputRowsToTeamInputs(rows: WeeklyInputRow[]): TeamInput[] {
  return rows.map((row) => {
    const department =
      DB_TO_UI_DEPARTMENT[
        row.department as keyof typeof DB_TO_UI_DEPARTMENT
      ] ?? "operations";

    return {
      id: row.id,
      department,
      type: row.type,
      importance: "medium",
      author: row.profiles?.full_name?.trim() || "Equipo",
      submittedAt: row.updated_at ?? row.created_at,
      preview:
        row.content?.slice(0, 120) ||
        (row.rating != null ? `Calificación: ${row.rating}/5` : "Input semanal"),
      rating: row.rating ?? undefined,
    };
  });
}

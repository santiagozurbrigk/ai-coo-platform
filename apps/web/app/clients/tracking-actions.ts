"use server";

/**
 * ⭐ El seguimiento del cliente y la revisión semanal.
 *
 * Dos cosas que viven juntas porque son la misma pregunta a dos escalas: el
 * objetivo, la fecha de egreso y el estado actual de **un** cliente; y la lista
 * de a quién hay que mirar **esta semana**.
 *
 * La revisión no guarda nada propio: se arma de lo que ya está —el recorrido de
 * C3, los wins de A, las cuotas del CRM— y se recalcula cada vez. Lo único que
 * se escribe desde ahí es el estado actual, que es la acción anotada.
 */

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isMissingTableError, requireOrganizationId } from "@/lib/auth/bootstrap";
import type { Client, ClientTracking } from "@/types/clients";
import type { ClientJourneyStatus } from "@/types/checkpoints";
import { buildWeeklyReview, type WeeklyReview } from "@/lib/clients/weekly-review";
import { deriveClientCase, groupWinsByClient } from "@/lib/wins";
import { listClientsAction } from "@/app/clients/actions";
import { getClientsJourneyStatusAction } from "@/app/clients/checkpoint-derived-actions";
import { listClientBaselinesAction, listWinsAction } from "@/app/clients/win-actions";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { firstZodError } from "@/lib/validations";
import { createClient } from "@/lib/supabase/server";
import { paths } from "@/routes";

type TrackingRow = {
  id: string;
  goal_text: string | null;
  goal_metric_key: string | null;
  goal_metric_value: number | string | null;
  goal_metric_unit: string | null;
  exit_date: string | null;
  current_status_note: string | null;
  current_metric_value: number | string | null;
  current_status_updated_at: string | null;
};

// ─── Lectura ────────────────────────────────────────────────────────────────

/** El seguimiento de todos los clientes de la organización, indexado por id. */
export async function listClientTrackingAction(): Promise<
  Record<string, ClientTracking>
> {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("clients")
      .select(
        "id, goal_text, goal_metric_key, goal_metric_value, goal_metric_unit, exit_date, current_status_note, current_metric_value, current_status_updated_at"
      )
      .eq("organization_id", organizationId);

    if (error) {
      if (isMissingTableError(error.message)) return {};
      console.error("[listClientTracking]", error.message);
      return {};
    }

    const result: Record<string, ClientTracking> = {};
    for (const row of data as TrackingRow[]) {
      result[row.id] = rowToTracking(row);
    }
    return result;
  } catch {
    return {};
  }
}

export type WeeklyReviewPageData = {
  review: WeeklyReview;
  clients: Client[];
  tracking: Record<string, ClientTracking>;
};

/**
 * La revisión semanal completa.
 *
 * ⭐ Todo se trae de una y se cruza en memoria: preguntar el recorrido, los wins
 * y las cuotas por cliente sería una consulta por fila de la lista.
 */
export async function getWeeklyReviewAction(): Promise<WeeklyReviewPageData> {
  const [clients, statuses, wins, baselines, tracking, lastEvents] = await Promise.all([
    listClientsAction(),
    getClientsJourneyStatusAction(),
    listWinsAction(),
    listClientBaselinesAction(),
    listClientTrackingAction(),
    lastCheckpointEventByClient(),
  ]);

  const winsByClient = groupWinsByClient(wins);
  const today = new Date().toISOString().slice(0, 10);

  const review = buildWeeklyReview(
    clients.map((client) => {
      const clientWins = winsByClient.get(client.id) ?? [];
      const status: ClientJourneyStatus | undefined = statuses[client.id];
      const outcome = deriveClientCase(clientWins, baselines[client.id] ?? null);

      // La última señal de vida es lo más reciente entre un win y un hito: las
      // dos cosas son "algo pasó con este cliente".
      const lastWinAt = clientWins.reduce<string | null>(
        (latest, win) => (latest === null || win.winDate > latest ? win.winDate : latest),
        null
      );
      const lastEventAt = lastEvents[client.id] ?? null;

      return {
        clientId: client.id,
        name: client.name,
        stalled: status?.stalled ?? false,
        overdueDays: status?.overdueDays ?? null,
        lastWinAt,
        measuredDelta: outcome.measured ? outcome.delta : null,
        lastActivityAt: maxDate(lastWinAt, lastEventAt),
        joinDate: client.joinDate,
        exitDate: tracking[client.id]?.exitDate ?? null,
        hasOverduePayment: hasOverduePayment(client, today),
      };
    })
  );

  return { review, clients, tracking };
}

// ─── Escritura ──────────────────────────────────────────────────────────────

const trackingSchema = z.object({
  goalText: z.string().trim().max(500).nullable().default(null),
  goalMetricKey: z.string().trim().max(60).nullable().default(null),
  goalMetricValue: z.number().finite().nullable().default(null),
  goalMetricUnit: z.string().trim().max(20).nullable().default(null),
  exitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha de egreso no es válida.")
    .nullable()
    .default(null),
});

export type ClientTrackingInput = z.input<typeof trackingSchema>;

/**
 * El objetivo y la fecha de egreso.
 *
 * Misma regla que el baseline: una clave sin número —o un número sin clave— no
 * forma una métrica objetivo, así que se guarda vacía en vez de a medias.
 */
export async function updateClientTrackingAction(
  clientId: string,
  input: ClientTrackingInput
): Promise<MutationResult<void>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const parsed = trackingSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstZodError(parsed.error));
    const values = parsed.data;

    const hasGoalMetric =
      values.goalMetricKey !== null && values.goalMetricValue !== null;

    const supabase = await createClient();
    const { error } = await supabase
      .from("clients")
      .update({
        goal_text: values.goalText,
        goal_metric_key: hasGoalMetric ? values.goalMetricKey : null,
        goal_metric_value: hasGoalMetric ? values.goalMetricValue : null,
        goal_metric_unit: hasGoalMetric ? values.goalMetricUnit : null,
        exit_date: values.exitDate,
      })
      .eq("id", clientId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidate(clientId);
  });
}

const statusSchema = z.object({
  note: z.string().trim().max(1000).nullable().default(null),
  metricValue: z.number().finite().nullable().default(null),
});

/**
 * El estado actual, en palabras.
 *
 * ⭐ Guarda **cuándo** se escribió. Un estado sin fecha envejece sin avisar, y a
 * los tres meses nadie sabe si "trabado en el guion" sigue siendo cierto.
 */
export async function updateClientCurrentStatusAction(
  clientId: string,
  input: z.input<typeof statusSchema>
): Promise<MutationResult<void>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const parsed = statusSchema.safeParse(input);
    if (!parsed.success) throw new Error(firstZodError(parsed.error));
    const values = parsed.data;

    const isEmpty = values.note === null && values.metricValue === null;

    const supabase = await createClient();
    const { error } = await supabase
      .from("clients")
      .update({
        current_status_note: values.note,
        current_metric_value: values.metricValue,
        // Borrar el estado borra su fecha: un "cuándo" sin "qué" no dice nada.
        current_status_updated_at: isEmpty ? null : new Date().toISOString(),
      })
      .eq("id", clientId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);
    revalidate(clientId);
  });
}

// ─── Ayudas ─────────────────────────────────────────────────────────────────

function revalidate(clientId: string) {
  revalidatePath(paths.platform.clients.weeklyReview);
  revalidatePath(paths.platform.clients.detail(clientId));
}

function rowToTracking(row: TrackingRow): ClientTracking {
  return {
    goalText: row.goal_text,
    goalMetricKey: row.goal_metric_key?.trim() || null,
    goalMetricValue: toNumber(row.goal_metric_value),
    goalMetricUnit: row.goal_metric_unit?.trim() || null,
    exitDate: row.exit_date,
    currentStatusNote: row.current_status_note,
    currentMetricValue: toNumber(row.current_metric_value),
    currentStatusUpdatedAt: row.current_status_updated_at,
  };
}

/** `numeric` llega como string por el driver. Un número ilegible no es cero. */
function toNumber(raw: number | string | null): number | null {
  if (raw === null) return null;
  const value = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(value) ? value : null;
}

/** La fecha del último hito registrado de cada cliente. */
async function lastCheckpointEventByClient(): Promise<Record<string, string>> {
  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("client_checkpoint_events")
      .select("client_id, reached_at")
      .eq("organization_id", organizationId);

    if (error) return {};

    const result: Record<string, string> = {};
    for (const row of data as { client_id: string; reached_at: string }[]) {
      const date = row.reached_at?.slice(0, 10);
      if (!date) continue;
      if (!result[row.client_id] || date > result[row.client_id]!) {
        result[row.client_id] = date;
      }
    }
    return result;
  } catch {
    return {};
  }
}

/** Una cuota pendiente con vencimiento pasado. Es la señal de pago atrasado. */
function hasOverduePayment(client: Client, today: string): boolean {
  return (client.installments ?? []).some(
    (installment) =>
      installment.status === "pending" &&
      typeof installment.dueDate === "string" &&
      installment.dueDate.slice(0, 10) < today
  );
}

function maxDate(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  return a > b ? a : b;
}

"use server";

import * as XLSX from "xlsx";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { createClient } from "@/lib/supabase/server";
import { parseClientsExcel, type ColumnMapping, type ClientImportRow } from "@/lib/clients/excel-parser";
import { parseClosingCallsExcel, type ClosingColumnMapping } from "@/lib/closing/excel-parser";

// ─── Preview de encabezados y primeras filas ──────────────────────────────────

export type ExcelPreview = {
  headers: string[];
  rows: Record<string, string>[];
};

export async function getExcelPreviewAction(
  fileBase64: string
): Promise<MutationResult<ExcelPreview>> {
  return runMutation(async () => {
    await requireOrganizationId();
    const buffer = Buffer.from(fileBase64, "base64");
    const wb = XLSX.read(buffer, { type: "buffer", raw: false });
    const sheetName = wb.SheetNames[0];
    if (!sheetName) throw new Error("El archivo no tiene hojas.");
    const sheet = wb.Sheets[sheetName];
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    });
    if (!raw.length) throw new Error("El archivo está vacío.");
    const headers = Object.keys(raw[0]).map((h) => h.trim());
    const rows = raw.slice(0, 5).map((r) => {
      const out: Record<string, string> = {};
      for (const k of Object.keys(r)) {
        out[k.trim()] = String(r[k] ?? "").slice(0, 80);
      }
      return out;
    });
    return { headers, rows };
  });
}

// ─── Tipos de resultado ───────────────────────────────────────────────────────

export type ExcelImportResult = {
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
};

// ─── Importar clientes desde Excel ───────────────────────────────────────────

/**
 * Recibe el archivo como base64 (vendrá del cliente via FormData serializado).
 * El Server Action no puede recibir File directamente en Next.js 15 app router
 * cuando se serializa por la red → lo enviamos como base64.
 */
export async function importClientsFromExcelAction(
  fileBase64: string,
  columnMapping?: ColumnMapping
): Promise<MutationResult<ExcelImportResult>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const buffer = Buffer.from(fileBase64, "base64");
    const { rows, errors } = parseClientsExcel(buffer, columnMapping);

    if (!rows.length) {
      return { inserted: 0, skipped: 0, errors: errors.length ? errors : [{ row: 0, message: "El archivo no contiene clientes para importar." }] };
    }

    // Buscar cuáles ya existen por nombre (case-insensitive)
    const names = rows.map((r) => r.name.toLowerCase());
    const { data: existing } = await supabase
      .from("clients")
      .select("name")
      .eq("organization_id", organizationId);

    const existingNamesLower = new Set(
      (existing ?? []).map((r: { name: string }) => r.name.toLowerCase())
    );

    const toInsert = rows.filter((r) => !existingNamesLower.has(r.name.toLowerCase()));
    const skipped = rows.length - toInsert.length;
    void names;

    if (!toInsert.length) {
      return { inserted: 0, skipped, errors };
    }

    const today = new Date().toISOString().split("T")[0];
    const insertPayload = toInsert.map((row: ClientImportRow) => ({
      organization_id: organizationId,
      name:            row.name,
      join_date:       row.joinDate || today,
      payment_type:    "upfront" as const,
      platform:        "other" as const,
      total_amount:    row.totalAmount ?? 0,
      status:          row.status ?? "active",
      is_success_case: false,
      installments:    [],
      ai_insights:     buildClientInsights(row),
      linked_calls:    [],
      offered_product: row.product ?? null,
    }));

    // Insertar en lotes de 50
    const BATCH = 50;
    let inserted = 0;
    for (let i = 0; i < insertPayload.length; i += BATCH) {
      const batch = insertPayload.slice(i, i + BATCH);
      const { error } = await supabase.from("clients").insert(batch);
      if (error) throw new Error(error.message);
      inserted += batch.length;
    }

    console.info(`[import-clients-excel] org=${organizationId} inserted=${inserted} skipped=${skipped}`);
    return { inserted, skipped, errors };
  });
}

function buildClientInsights(row: ClientImportRow): string[] {
  const insights: string[] = [];
  if (row.email) insights.push(`Email: ${row.email}`);
  if (row.phone) insights.push(`Teléfono: ${row.phone}`);
  if (row.notes) insights.push(`Notas: ${row.notes}`);
  return insights;
}

// ─── Importar llamadas de cierre desde Excel ──────────────────────────────────

export async function importClosingCallsFromExcelAction(
  fileBase64: string,
  columnMapping?: ClosingColumnMapping
): Promise<MutationResult<ExcelImportResult>> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const buffer = Buffer.from(fileBase64, "base64");
    const { rows, errors } = parseClosingCallsExcel(buffer, columnMapping);

    if (!rows.length) {
      return { inserted: 0, skipped: 0, errors: errors.length ? errors : [{ row: 0, message: "El archivo no contiene llamadas para importar." }] };
    }

    const insertPayload = rows.map((row) => ({
      organization_id: organizationId,
      lead_name:       row.leadName,
      scheduled_at:    row.scheduledAt,
      status:          row.status,
      form_answers:    buildClosingFormAnswers(row),
    }));

    const BATCH = 50;
    let inserted = 0;
    for (let i = 0; i < insertPayload.length; i += BATCH) {
      const batch = insertPayload.slice(i, i + BATCH);
      const { error } = await supabase.from("closing_calls").insert(batch);
      if (error) throw new Error(error.message);
      inserted += batch.length;
    }

    console.info(`[import-closing-excel] org=${organizationId} inserted=${inserted}`);
    return { inserted, skipped: 0, errors };
  });
}

function buildClosingFormAnswers(row: { email?: string; amountClosed?: number; notes?: string }) {
  const answers: Array<{ question: string; answer: string }> = [];
  if (row.email)       answers.push({ question: "Email",          answer: row.email });
  if (row.amountClosed) answers.push({ question: "Monto cerrado", answer: String(row.amountClosed) });
  if (row.notes)       answers.push({ question: "Notas",          answer: row.notes });
  return answers;
}

"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { requireAuthContext } from "@/lib/auth/require-auth";
import { callClaudeJson } from "@/lib/ai/anthropic";
import { parseWorkbookSheets, extractRowsFromSheets } from "@/lib/import/excel-parser";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  FileAnalysis,
  ColumnMapping,
  ImportResult,
  ImportBatch,
  SheetPreview,
} from "@/types/import";
import { CLOSING_FIELDS } from "@/types/import";

const IMPORT_BUCKET = "import-files";

const CLOSING_STATUS_MAP: Record<string, string> = {
  cerrado: "closed",
  "no cerrado": "not_closed",
  "no show": "no_show",
  closed: "closed",
  "not closed": "not_closed",
};

// ─── Step 1: Analyze file (by storage path) ──────────────────────────────────

export async function analyzeImportFileAction(
  storagePath: string,
  fileName: string
): Promise<{ success: true; data: FileAnalysis } | { success: false; error: string }> {
  try {
    const admin = createAdminClient();

    const { data: fileData, error: downloadErr } = await admin.storage
      .from(IMPORT_BUCKET)
      .download(storagePath);

    if (downloadErr || !fileData) {
      return { success: false, error: "No se pudo leer el archivo del servidor." };
    }

    const ext = fileName.split(".").pop()?.toLowerCase();
    const supported = ["xlsx", "xls", "xlsm", "csv"];
    if (!ext || !supported.includes(ext)) {
      return { success: false, error: `Formato no soportado (.${ext}). Usá .xlsx, .xls o .csv.` };
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    let sheets: SheetPreview[];
    if (ext === "csv") {
      const { default: Papa } = await import("papaparse");
      const text = buffer.toString("utf-8");
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });
      const headers = parsed.meta.fields ?? [];
      sheets = [
        {
          name: "Hoja1",
          headerRow: 0,
          headers,
          sampleRows: (parsed.data as Record<string, string>[]).slice(0, 5),
          totalRows: parsed.data.length,
          filledPct: 90,
          detectedType: "closing_leads",
          detectedTypeLabel: "Lista de leads / closing",
        },
      ];
    } else {
      sheets = parseWorkbookSheets(buffer);
    }

    if (sheets.length === 0) {
      return { success: false, error: "No se encontraron hojas con datos reconocibles en el archivo." };
    }

    const organizationId = await requireOrganizationId();
    const sheetsInfo = sheets.map((s) => ({
      name: s.name,
      headers: s.headers.slice(0, 20),
      rows: s.totalRows,
      detectedType: s.detectedType,
      sample: s.sampleRows[0] ?? {},
    }));

    const aiResponse = await callClaudeJson<{
      recommendedSheets: string[];
      recommendedModule: "closing" | "finance" | "content";
      mergeStrategy: "concatenate" | "first_only";
      reasoning: string;
    }>({
      organizationId,
      task: "data_extraction",
      feature: "import_file_analysis",
      user: `Sos un asistente de importación de datos para una plataforma de negocios.
Analizá estas hojas de un archivo de Excel/CSV y determiná cuáles contienen datos para importar.

Módulos disponibles:
- "closing": llamadas de ventas, leads, cierres, agendas de closing
- "finance": gastos, pagos, facturas, finanzas
- "content": posts de redes sociales, contenido, métricas de contenido

Hojas del archivo:
${JSON.stringify(sheetsInfo, null, 2)}

Respondé con un JSON con exactamente estos campos:
- recommendedSheets: array con los nombres exactos de las hojas que tienen datos relevantes para importar (excluir resúmenes, dashboards, hojas vacías o de configuración)
- recommendedModule: el módulo más apropiado para los datos encontrados
- mergeStrategy: "concatenate" si hay múltiples hojas del mismo tipo que deben combinarse, "first_only" si solo se debe usar la primera
- reasoning: explicación breve en español de por qué elegiste esas hojas

Solo incluir en recommendedSheets las hojas con datos de transacciones/registros, no resúmenes ni totales.`,
    });

    const recommendedSheets =
      aiResponse?.recommendedSheets?.filter((n: string) =>
        sheets.some((s) => s.name === n)
      ) ?? sheets.slice(0, 1).map((s) => s.name);

    return {
      success: true,
      data: {
        sheets,
        recommendedSheets,
        recommendedModule: aiResponse?.recommendedModule ?? "closing",
        mergeStrategy: aiResponse?.mergeStrategy ?? "concatenate",
        aiReasoning: aiResponse?.reasoning ?? "",
      },
    };
  } catch (err) {
    console.error("[analyzeImportFileAction]", err);
    return { success: false, error: "Error al analizar el archivo." };
  }
}

// ─── Step 2: AI column mapping suggestion ────────────────────────────────────

export async function suggestColumnMappingAction(
  headers: string[],
  sampleRow: Record<string, string>,
  module: "closing" | "finance" | "content"
): Promise<{ success: true; data: ColumnMapping } | { success: false; error: string }> {
  try {
    const organizationId = await requireOrganizationId();
    const fields = CLOSING_FIELDS;

    const mapping = await callClaudeJson<Record<string, string | null>>({
      organizationId,
      task: "data_extraction",
      feature: "import_column_mapping",
      user: `Tenés que mapear columnas de una planilla a los campos de OTC.

Columnas disponibles en la planilla:
${headers.map((h, i) => `${i + 1}. "${h}"`).join("\n")}

Ejemplo de fila de datos:
${JSON.stringify(sampleRow, null, 2)}

Campos OTC disponibles (con su descripción):
${fields.map((f) => `- "${f.key}": ${f.label} — ${f.description}`).join("\n")}

Respondé con un JSON donde:
- Las claves son los nombres de campos OTC (ej: "lead_name")
- Los valores son el nombre EXACTO de la columna de la planilla que mejor corresponde, o null si no hay columna adecuada
- Solo mapear cuando estés seguro de que la columna corresponde al campo
- "lead_name" puede mapearse a columnas como "Nombre", "Lead", "Cliente", "Nombre del Lead", etc.
- "scheduled_at" puede mapearse a "Fecha", "Fecha Agenda", "Fecha Llamada", "Date", etc.
- "status" puede mapearse a "Estado", "Resultado", "Status", etc.
- "amount" puede mapearse a "Monto", "Importe", "Facturación", "Precio", etc.
- "setter_name" puede mapearse a "Setter", "Quien Agenda", "Agendador", etc.
- "closed_by_name" puede mapearse a "Closer", "Quien Cierra", "Vendedor", etc.`,
    });

    return { success: true, data: mapping ?? {} };
  } catch (err) {
    console.error("[suggestColumnMappingAction]", err);
    return { success: false, error: "Error al sugerir el mapeo de columnas." };
  }
}

// ─── Step 3: Execute import (reads from storage) ──────────────────────────────

export async function executeImportAction(
  storagePath: string,
  fileName: string,
  selectedSheets: string[],
  columnMapping: ColumnMapping,
  module: "closing" | "finance" | "content"
): Promise<{ success: true; data: ImportResult } | { success: false; error: string }> {
  try {
    const { user, orgId } = await requireAuthContext();
    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: fileData, error: downloadErr } = await admin.storage
      .from(IMPORT_BUCKET)
      .download(storagePath);

    if (downloadErr || !fileData) {
      return { success: false, error: "No se pudo descargar el archivo del servidor." };
    }

    const ext = fileName.split(".").pop()?.toLowerCase();
    const buffer = Buffer.from(await fileData.arrayBuffer());

    let allRows: Record<string, string>[];
    if (ext === "csv") {
      const { default: Papa } = await import("papaparse");
      const text = buffer.toString("utf-8");
      const parsed = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });
      allRows = parsed.data as Record<string, string>[];
    } else {
      const sheets = parseWorkbookSheets(buffer);
      const headersBySheet: Record<string, { headerRow: number; headers: string[] }> = {};
      for (const s of sheets) {
        if (selectedSheets.includes(s.name)) {
          headersBySheet[s.name] = { headerRow: s.headerRow, headers: s.headers };
        }
      }
      allRows = extractRowsFromSheets(buffer, selectedSheets, headersBySheet);
    }

    // Create import batch record
    const { data: batch, error: batchErr } = await supabase
      .from("import_batches")
      .insert({
        organization_id: orgId,
        module,
        file_name: fileName,
        status: "pending",
        column_mapping: columnMapping,
        selected_sheets: selectedSheets,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (batchErr || !batch) {
      return { success: false, error: "Error al crear el registro de importación." };
    }

    // Process rows
    const imported: object[] = [];
    const skipReasons: { rowIndex: number; reason: string }[] = [];

    for (let i = 0; i < allRows.length; i++) {
      const raw = allRows[i];
      try {
        if (module === "closing") {
          const row = mapClosingRow(raw, columnMapping, i + 1);
          if (!row) continue;
          if ("skip" in row) {
            skipReasons.push({ rowIndex: i + 1, reason: String(row.skip) });
            continue;
          }
          imported.push({
            ...row,
            organization_id: orgId,
            import_source: "excel_import",
            import_batch_id: batch.id,
          });
        }
      } catch (err) {
        skipReasons.push({
          rowIndex: i + 1,
          reason: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }

    // Bulk insert in chunks of 100
    let insertedCount = 0;
    const chunkSize = 100;
    for (let i = 0; i < imported.length; i += chunkSize) {
      const chunk = imported.slice(i, i + chunkSize);
      const { error: insertErr } = await admin.from("closing_calls").insert(chunk);
      if (insertErr) {
        console.error("[executeImportAction] insert chunk error", insertErr);
      } else {
        insertedCount += chunk.length;
      }
    }

    // Update batch record
    await supabase
      .from("import_batches")
      .update({
        status: "completed",
        rows_imported: insertedCount,
        rows_skipped: skipReasons.length,
        skip_reasons: skipReasons,
        updated_at: new Date().toISOString(),
      })
      .eq("id", batch.id);

    // Clean up temp file from storage
    await admin.storage.from(IMPORT_BUCKET).remove([storagePath]);

    return {
      success: true,
      data: {
        batchId: batch.id,
        imported: insertedCount,
        skipped: skipReasons.length,
        skipReasons,
      },
    };
  } catch (err) {
    console.error("[executeImportAction]", err);
    return { success: false, error: "Error al ejecutar la importación." };
  }
}

// ─── Undo import ──────────────────────────────────────────────────────────────

export async function undoImportAction(
  batchId: string
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const { orgId } = await requireAuthContext();
    const supabase = await createClient();
    const admin = createAdminClient();

    const { data: batch } = await supabase
      .from("import_batches")
      .select("id, status")
      .eq("id", batchId)
      .eq("organization_id", orgId)
      .maybeSingle();

    if (!batch) return { success: false, error: "Importación no encontrada." };
    if (batch.status === "undone") return { success: false, error: "Esta importación ya fue deshecha." };

    await admin.from("closing_calls").delete().eq("import_batch_id", batchId);
    await supabase
      .from("import_batches")
      .update({ status: "undone", updated_at: new Date().toISOString() })
      .eq("id", batchId);

    return { success: true };
  } catch (err) {
    console.error("[undoImportAction]", err);
    return { success: false, error: "Error al deshacer la importación." };
  }
}

// ─── List past imports ────────────────────────────────────────────────────────

export async function listImportBatchesAction(): Promise<ImportBatch[]> {
  try {
    const supabase = await createClient();
    const orgId = await requireOrganizationId();
    const { data } = await supabase
      .from("import_batches")
      .select("id, module, file_name, status, rows_imported, rows_skipped, created_at")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false })
      .limit(20);

    return (data ?? []).map((r) => ({
      id: r.id,
      module: r.module as ImportBatch["module"],
      fileName: r.file_name,
      status: r.status as ImportBatch["status"],
      rowsImported: r.rows_imported,
      rowsSkipped: r.rows_skipped,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapClosingRow(
  raw: Record<string, string>,
  mapping: ColumnMapping,
  rowNum: number
): ({ form_answers: string[]; lead_name: string; scheduled_at: string; status: string; amount?: number; setter_name?: string; closed_by_name?: string } & Record<string, unknown>) | { skip: string } | null {
  const get = (field: string) => {
    const col = mapping[field];
    if (!col) return "";
    return (raw[col] ?? "").trim();
  };

  const leadName = get("lead_name");
  if (!leadName) return { skip: `Fila ${rowNum}: sin nombre de lead` };

  const rawDate = get("scheduled_at");
  const scheduledAt: string = parseDate(rawDate) ?? new Date("2000-01-01").toISOString();

  const rawStatus = get("status").toLowerCase();
  const status = CLOSING_STATUS_MAP[rawStatus] ?? "not_closed";

  const rawAmount = get("amount").replace(/[^0-9.,]/g, "").replace(",", ".");
  const amount = rawAmount ? parseFloat(rawAmount) || undefined : undefined;

  return {
    lead_name: leadName,
    scheduled_at: scheduledAt,
    status,
    ...(amount !== undefined && { amount }),
    ...(get("setter_name") && { setter_name: get("setter_name") }),
    ...(get("closed_by_name") && { closed_by_name: get("closed_by_name") }),
    form_answers: [],
  };
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})$/);
  if (match) {
    const [, d, m, y] = match;
    const year = y.length === 2 ? `20${y}` : y;
    const date = new Date(`${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString();
  return null;
}

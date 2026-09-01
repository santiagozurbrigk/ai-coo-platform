import type { ClosingCallStatus } from "@/types/closing";
/**
 * Parser de Excel para importación de llamadas de cierre.
 * Soporta plantilla Limitless (tab "Llamadas de cierre") y archivos propios.
 */

import * as XLSX from "xlsx";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ClosingCallImportRow = {
  leadName: string;
  email?: string;
  scheduledAt: string;    // ISO 8601
  status: ClosingCallStatus;
  amountClosed?: number;
  notes?: string;
};

export type ClosingColumnMapping = {
  leadName: string;
  email?: string;
  scheduledAt: string;
  status?: string;
  amountClosed?: string;
  notes?: string;
};

export type ParseClosingResult = {
  headers: string[];
  rows: ClosingCallImportRow[];
  errors: Array<{ row: number; message: string }>;
};

// ─── Columnas plantilla Limitless ───────────────────────────────────────────────────

const OTC_CLOSING_COLUMNS: ClosingColumnMapping = {
  leadName:    "Nombre prospecto",
  email:       "Email",
  scheduledAt: "Fecha y hora",
  status:      "Estado",
  amountClosed: "Monto cerrado",
  notes:       "Notas / resultado",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeHeader(h: string): string {
  return h.toString().trim().toLowerCase();
}

function resolveStatus(raw: string | undefined): ClosingCallImportRow["status"] {
  const v = (raw ?? "").toLowerCase().trim();
  if (v === "cerrado" || v === "closed" || v === "ganado" || v === "won") return "closed";
  if (v === "no_cerrado" || v === "not_closed" || v === "no cerrado" || v === "perdido" || v === "lost") return "not_closed";
  if (v === "no_show" || v === "no show" || v === "noshow") return "no_show";
  if (v === "cancelado" || v === "cancelada" || v === "cancelled" || v === "canceled") return "cancelled";
  if (v === "asistio" || v === "asistió" || v === "attended" || v === "showed") return "attended";
  if (v === "agendado" || v === "scheduled" || v === "pendiente") return "scheduled";
  return "closed"; // default: si el usuario lo registró, fue cerrado
}

function resolveAmount(raw: unknown): number | undefined {
  if (raw == null || raw === "") return undefined;
  const n = Number(String(raw).replace(/[^\d.,]/g, "").replace(",", "."));
  return isNaN(n) || n === 0 ? undefined : n;
}

function resolveDateTime(raw: unknown): string {
  if (!raw) return new Date().toISOString();
  if (typeof raw === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(raw);
    if (d) {
      const month = String(d.m).padStart(2, "0");
      const day   = String(d.d).padStart(2, "0");
      const hour  = String(d.H ?? 0).padStart(2, "0");
      const min   = String(d.M ?? 0).padStart(2, "0");
      return `${d.y}-${month}-${day}T${hour}:${min}:00`;
    }
  }
  const s = String(raw).trim();
  // DD/MM/AAAA HH:mm o DD/MM/AAAA
  const dmatch = s.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (dmatch) {
    const [, d, m, y, h = "00", min = "00"] = dmatch;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${h.padStart(2, "0")}:${min}:00`;
  }
  // ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.includes("T") ? s : `${s}T00:00:00`;
  return new Date().toISOString();
}

// ─── Parse con mapeo de columnas ─────────────────────────────────────────────

export function parseClosingCallsExcel(
  buffer: Buffer | ArrayBuffer,
  columnMapping?: ClosingColumnMapping
): ParseClosingResult {
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: false });

  const sheetName =
    wb.SheetNames.find((n) => n.toLowerCase().includes("llamada") || n.toLowerCase().includes("cierre")) ??
    wb.SheetNames[0];

  if (!sheetName) {
    return { headers: [], rows: [], errors: [{ row: 0, message: "Archivo sin hojas." }] };
  }

  const sheet = wb.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: true,
  });

  if (!raw.length) {
    return { headers: [], rows: [], errors: [{ row: 0, message: "Hoja sin datos." }] };
  }

  const headers = Object.keys(raw[0]).map((h) => h.trim());
  const mapping: ClosingColumnMapping = columnMapping ?? OTC_CLOSING_COLUMNS;

  const headersByNorm: Record<string, string> = {};
  for (const h of headers) headersByNorm[normalizeHeader(h)] = h;

  function findColumn(label: string | undefined): string | undefined {
    if (!label) return undefined;
    return headersByNorm[normalizeHeader(label)];
  }

  const leadNameCol  = findColumn(mapping.leadName);
  const emailCol     = findColumn(mapping.email);
  const dateCol      = findColumn(mapping.scheduledAt);
  const statusCol    = findColumn(mapping.status);
  const amountCol    = findColumn(mapping.amountClosed);
  const notesCol     = findColumn(mapping.notes);

  const rows: ClosingCallImportRow[] = [];
  const errors: Array<{ row: number; message: string }> = [];

  raw.forEach((r, idx) => {
    const rowNum = idx + 2;

    // Ignorar filas completamente vacías (mismo patrón que excel-parser de clientes)
    const allEmpty = Object.values(r).every((v) => !String(v ?? "").trim());
    if (allEmpty) return;

    const leadName = leadNameCol ? String(r[leadNameCol] ?? "").trim() : "";
    if (!leadName) {
      errors.push({ row: rowNum, message: "Nombre vacío — fila omitida." });
      return;
    }

    const rawDate = dateCol ? r[dateCol] : undefined;
    if (!rawDate) {
      errors.push({ row: rowNum, message: `Fila ${rowNum}: sin fecha — omitida.` });
      return;
    }

    rows.push({
      leadName,
      email:       emailCol  ? String(r[emailCol] ?? "").trim()  || undefined : undefined,
      scheduledAt: resolveDateTime(rawDate),
      status:      resolveStatus(statusCol ? String(r[statusCol]) : undefined),
      amountClosed: resolveAmount(amountCol ? r[amountCol] : undefined),
      notes:       notesCol  ? String(r[notesCol] ?? "").trim()  || undefined : undefined,
    });
  });

  return { headers, rows, errors };
}

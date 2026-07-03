import type { ImportClientsRowError } from "@/app/clients/actions";
import type { Client } from "@/types/clients";

export const CLIENT_IMPORT_REQUIRED_HEADERS = [
  "name",
  "joinDate",
  "paymentType",
  "platform",
  "totalAmount",
] as const;

export const CLIENT_IMPORT_TEMPLATE_HEADERS = [
  ...CLIENT_IMPORT_REQUIRED_HEADERS,
  "status",
  "nickname",
  "salesFathomUrl",
] as const;

export const CLIENT_IMPORT_TEMPLATE = `${CLIENT_IMPORT_TEMPLATE_HEADERS.join(",")}
Acme SA,2026-07-03,upfront,stripe,1500,pending_onboarding,Cuenta Acme,https://fathom.video/share/demo`;

const PAYMENT_TYPES = ["upfront", "installments", "upfront_fee"] as const;
const PLATFORMS = ["stripe", "mercadopago", "paypal", "bank_transfer", "other"] as const;
const STATUSES = [
  "pending_onboarding",
  "onboarding_done",
  "active",
  "success_case",
] as const;

type CsvPaymentType = (typeof PAYMENT_TYPES)[number];
type CsvPlatform = (typeof PLATFORMS)[number];
type CsvStatus = (typeof STATUSES)[number];

export type ParsedClientImport = {
  rows: Omit<Client, "id">[];
  errors: ImportClientsRowError[];
};

function includesValue<T extends readonly string[]>(
  values: T,
  value: string
): value is T[number] {
  return values.includes(value as T[number]);
}

function normalizeHeader(header: string): string {
  return header.trim().replace(/^\uFEFF/, "");
}

function parseClientRow(
  row: Record<string, string>,
  rowNumber: number
): { client: Omit<Client, "id"> | null; errors: ImportClientsRowError[] } {
  const errors: ImportClientsRowError[] = [];
  const totalAmount = Number(row.totalAmount);

  if (!Number.isFinite(totalAmount)) {
    errors.push({ row: rowNumber, message: "totalAmount debe ser un número" });
  }

  const paymentType = row.paymentType || "upfront";
  const platform = row.platform || "other";
  const status = row.status || "pending_onboarding";

  if (!row.name?.trim()) {
    errors.push({ row: rowNumber, message: "name es obligatorio" });
  }

  if (!row.joinDate?.trim()) {
    errors.push({ row: rowNumber, message: "joinDate es obligatorio (YYYY-MM-DD)" });
  }

  if (!includesValue(PAYMENT_TYPES, paymentType)) {
    errors.push({
      row: rowNumber,
      message: "paymentType debe ser upfront, installments o upfront_fee",
    });
  }

  if (!includesValue(PLATFORMS, platform)) {
    errors.push({
      row: rowNumber,
      message: "platform debe ser stripe, mercadopago, paypal, bank_transfer u other",
    });
  }

  if (!includesValue(STATUSES, status)) {
    errors.push({
      row: rowNumber,
      message:
        "status debe ser pending_onboarding, onboarding_done, active o success_case",
    });
  }

  if (errors.length > 0) return { client: null, errors };

  return {
    client: {
      name: row.name.trim(),
      nickname: row.nickname?.trim() || undefined,
      joinDate: row.joinDate.trim(),
      paymentType: paymentType as CsvPaymentType,
      platform: platform as CsvPlatform,
      totalAmount,
      status: status as CsvStatus,
      isSuccessCase: status === "success_case",
      salesFathomUrl: row.salesFathomUrl?.trim() || undefined,
      aiInsights: ["Cliente importado desde archivo."],
      linkedCalls: [],
    },
    errors: [],
  };
}

function validateHeaders(headers: string[]): ImportClientsRowError[] {
  const missing = CLIENT_IMPORT_REQUIRED_HEADERS.filter(
    (header) => !headers.includes(header)
  );
  if (missing.length === 0) return [];
  return [
    {
      row: 1,
      message: `Faltan columnas requeridas: ${missing.join(", ")}`,
    },
  ];
}

export function parseClientImportRows(
  records: Record<string, string>[]
): ParsedClientImport {
  if (records.length === 0) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message: "El archivo debe incluir encabezados y al menos una fila",
        },
      ],
    };
  }

  const headers = Object.keys(records[0] ?? {}).map(normalizeHeader);
  const headerErrors = validateHeaders(headers);
  if (headerErrors.length > 0) {
    return { rows: [], errors: headerErrors };
  }

  const errors: ImportClientsRowError[] = [];
  const rows: Omit<Client, "id">[] = [];

  records.forEach((record, index) => {
    const normalized = Object.fromEntries(
      Object.entries(record).map(([key, value]) => [
        normalizeHeader(key),
        String(value ?? "").trim(),
      ])
    );
    const parsed = parseClientRow(normalized, index + 2);
    errors.push(...parsed.errors);
    if (parsed.client) rows.push(parsed.client);
  });

  return { rows, errors };
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseClientsCsv(text: string): ParsedClientImport {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message: "El CSV debe incluir encabezados y al menos una fila",
        },
      ],
    };
  }

  const headers = parseCsvLine(lines[0] ?? "").map(normalizeHeader);
  const headerErrors = validateHeaders(headers);
  if (headerErrors.length > 0) {
    return { rows: [], errors: headerErrors };
  }

  const records = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(
      headers.map((header, headerIndex) => [header, values[headerIndex]?.trim() ?? ""])
    );
  });

  return parseClientImportRows(records);
}

export async function parseClientsImportFile(file: File): Promise<ParsedClientImport> {
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".csv") || file.type === "text/csv") {
    return parseClientsCsv(await file.text());
  }

  if (
    lowerName.endsWith(".xlsx") ||
    lowerName.endsWith(".xls") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel"
  ) {
    const { read, utils } = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return {
        rows: [],
        errors: [{ row: 1, message: "El archivo Excel no contiene hojas" }],
      };
    }

    const records = utils.sheet_to_json<Record<string, string>>(workbook.Sheets[sheetName], {
      defval: "",
      raw: false,
    });

    return parseClientImportRows(records);
  }

  return {
    rows: [],
    errors: [
      {
        row: 1,
        message: "Formato no soportado. Usá CSV o Excel (.xlsx)",
      },
    ],
  };
}

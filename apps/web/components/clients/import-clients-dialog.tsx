"use client";

import { useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ai-coo/ui";
import { Upload } from "lucide-react";
import {
  importClientsAction,
  type ImportClientsRowError,
} from "@/app/clients/actions";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import type { Client } from "@/types/clients";

const REQUIRED_HEADERS = [
  "name",
  "joinDate",
  "paymentType",
  "platform",
  "totalAmount",
] as const;

const TEMPLATE_HEADERS = [
  ...REQUIRED_HEADERS,
  "status",
  "nickname",
  "salesFathomUrl",
];

const TEMPLATE = `${TEMPLATE_HEADERS.join(",")}
Acme SA,2026-07-03,upfront,stripe,1500,pending_onboarding,Cuenta Acme,https://fathom.video/share/demo`;

const PAYMENT_TYPES = ["upfront", "installments", "upfront_fee"] as const;
const PLATFORMS = ["stripe", "mercadopago", "paypal", "bank_transfer", "other"] as const;
const STATUSES = [
  "pending_onboarding",
  "onboarding_done",
  "active",
  "success_case",
] as const;

type ParsedCsv = {
  rows: Omit<Client, "id">[];
  errors: ImportClientsRowError[];
};

type CsvPaymentType = (typeof PAYMENT_TYPES)[number];
type CsvPlatform = (typeof PLATFORMS)[number];
type CsvStatus = (typeof STATUSES)[number];

function includesValue<T extends readonly string[]>(values: T, value: string): value is T[number] {
  return values.includes(value as T[number]);
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

function parseClientsCsv(text: string): ParsedCsv {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    return {
      rows: [],
      errors: [{ row: 1, message: "El CSV debe incluir encabezados y al menos una fila" }],
    };
  }

  const headers = parseCsvLine(lines[0] ?? "").map((header) => header.trim());
  const missing = REQUIRED_HEADERS.filter((header) => !headers.includes(header));

  if (missing.length > 0) {
    return {
      rows: [],
      errors: [
        {
          row: 1,
          message: `Faltan columnas requeridas: ${missing.join(", ")}`,
        },
      ],
    };
  }

  const errors: ImportClientsRowError[] = [];
  const rows = lines.slice(1).map((line, index) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(
      headers.map((header, headerIndex) => [header, values[headerIndex]?.trim() ?? ""])
    );

    const totalAmount = Number(row.totalAmount);
    if (!Number.isFinite(totalAmount)) {
      errors.push({ row: index + 2, message: "totalAmount debe ser un número" });
    }

    const paymentType = row.paymentType || "upfront";
    const platform = row.platform || "other";
    const status = row.status || "pending_onboarding";

    if (!includesValue(PAYMENT_TYPES, paymentType)) {
      errors.push({
        row: index + 2,
        message: "paymentType debe ser upfront, installments o upfront_fee",
      });
    }

    if (!includesValue(PLATFORMS, platform)) {
      errors.push({
        row: index + 2,
        message: "platform debe ser stripe, mercadopago, paypal, bank_transfer u other",
      });
    }

    if (!includesValue(STATUSES, status)) {
      errors.push({
        row: index + 2,
        message:
          "status debe ser pending_onboarding, onboarding_done, active o success_case",
      });
    }

    return {
      name: row.name ?? "",
      nickname: row.nickname || undefined,
      joinDate: row.joinDate ?? "",
      paymentType: (includesValue(PAYMENT_TYPES, paymentType)
        ? paymentType
        : "upfront") as CsvPaymentType,
      platform: (includesValue(PLATFORMS, platform) ? platform : "other") as CsvPlatform,
      totalAmount,
      status: (includesValue(STATUSES, status)
        ? status
        : "pending_onboarding") as CsvStatus,
      isSuccessCase: status === "success_case",
      salesFathomUrl: row.salesFathomUrl || undefined,
      aiInsights: ["Cliente importado por CSV."],
      linkedCalls: [],
    } satisfies Omit<Client, "id">;
  });

  return { rows, errors };
}

export function ImportClientsDialog() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { refreshClients } = usePlatformData();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<Omit<Client, "id">[]>([]);
  const [errors, setErrors] = useState<ImportClientsRowError[]>([]);
  const [saving, setSaving] = useState(false);

  const handleFile = async (file: File | null) => {
    setFileName(file?.name ?? null);
    setRows([]);
    setErrors([]);
    if (!file) return;

    const parsed = parseClientsCsv(await file.text());
    setRows(parsed.rows);
    setErrors(parsed.errors);
  };

  const handleImport = async () => {
    setSaving(true);
    try {
      const result = await importClientsAction(rows);
      if (result.errors.length > 0) {
        setErrors(result.errors);
        return;
      }
      await refreshClients();
      push({
        title: "Clientes importados",
        description: `${result.insertedCount} clientes cargados correctamente.`,
        variant: "success",
      });
      setOpen(false);
      setFileName(null);
      setRows([]);
      setErrors([]);
      if (inputRef.current) inputRef.current.value = "";
    } catch (error) {
      push({
        title: "No se pudieron importar los clientes",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="gap-2" onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" />
        Cargar clientes
      </Button>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cargar clientes por CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="font-medium">Formato requerido</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Columnas obligatorias: {REQUIRED_HEADERS.join(", ")}. Valores válidos:
              paymentType = upfront, installments, upfront_fee; platform = stripe,
              mercadopago, paypal, bank_transfer, other.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-background p-3 text-xs text-muted-foreground">
              {TEMPLATE}
            </pre>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground"
          />

          {fileName ? (
            <p className="text-xs text-muted-foreground">
              Archivo: {fileName} · Filas detectadas: {rows.length}
            </p>
          ) : null}

          {errors.length > 0 ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
              <p className="text-sm font-medium text-destructive">
                Revisá estas filas antes de importar
              </p>
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-destructive">
                {errors.map((error, index) => (
                  <li key={`${error.row}-${index}`}>
                    Fila {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={() => void handleImport()}
            disabled={saving || rows.length === 0 || errors.length > 0}
          >
            {saving ? "Importando…" : "Importar clientes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

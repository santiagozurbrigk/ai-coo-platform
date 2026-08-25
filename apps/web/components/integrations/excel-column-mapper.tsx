"use client";

import { useState, useMemo } from "react";
import type { ColumnMapping } from "@/lib/clients/excel-parser";
import type { ClosingColumnMapping } from "@/lib/closing/excel-parser";

// ─── Definición de campos OTC ─────────────────────────────────────────────────

type FieldDef = {
  key: string;
  label: string;
  required: boolean;
  hint?: string;
};

const CLIENT_FIELDS: FieldDef[] = [
  { key: "name",        label: "Nombre",          required: true },
  { key: "email",       label: "Email",            required: false },
  { key: "phone",       label: "Teléfono",         required: false },
  { key: "status",      label: "Estado",           required: false, hint: "activo / onboarding / éxito" },
  { key: "product",     label: "Producto / Plan",  required: false },
  { key: "totalAmount", label: "Monto total",      required: false },
  { key: "joinDate",    label: "Fecha de inicio",  required: false },
  { key: "notes",       label: "Notas",            required: false },
];

const CLOSING_FIELDS: FieldDef[] = [
  { key: "leadName",    label: "Nombre prospecto", required: true },
  { key: "scheduledAt", label: "Fecha y hora",     required: true },
  { key: "email",       label: "Email",            required: false },
  { key: "status",      label: "Estado",           required: false, hint: "cerrado / no_cerrado / no_show" },
  { key: "amountClosed", label: "Monto cerrado",   required: false },
  { key: "notes",       label: "Notas",            required: false },
];

// ─── Prop types ───────────────────────────────────────────────────────────────

// Durante la edición UI los campos requeridos pueden estar vacíos → Partial
type MappingValue = Partial<ColumnMapping> | Partial<ClosingColumnMapping>;

type SingleMapperProps = {
  type: "clients" | "closing";
  headers: string[];
  previewRows: Record<string, string>[];
  value: MappingValue;
  onChange: (m: MappingValue) => void;
};

// ─── Selector de columna ──────────────────────────────────────────────────────

function ColumnSelect({
  fieldLabel,
  required,
  hint,
  headers,
  selected,
  onSelect,
  previewRows,
}: {
  fieldLabel: string;
  required: boolean;
  hint?: string;
  headers: string[];
  selected: string;
  onSelect: (v: string) => void;
  previewRows: Record<string, string>[];
}) {
  const sample = useMemo(() => {
    if (!selected) return null;
    return previewRows
      .map((r) => r[selected])
      .filter(Boolean)
      .slice(0, 2)
      .join(" · ");
  }, [selected, previewRows]);

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      {/* Campo OTC */}
      <div className="w-36 shrink-0 pt-0.5">
        <span className="text-sm font-medium">
          {fieldLabel}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </span>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>

      {/* Selector */}
      <div className="flex-1 min-w-0">
        <select
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full h-8 rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">— No importar —</option>
          {headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        {sample && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            ej. {sample}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Mapper de un tipo (clientes o closing) ───────────────────────────────────

function SingleMapper({ type, headers, previewRows, value, onChange }: SingleMapperProps) {
  const fields = type === "clients" ? CLIENT_FIELDS : CLOSING_FIELDS;

  const get = (key: string): string => {
    return (value as Record<string, string | undefined>)[key] ?? "";
  };

  const set = (key: string, col: string) => {
    onChange({ ...value, [key]: col || undefined } as MappingValue);
  };

  return (
    <div className="divide-y divide-border">
      {fields.map((f) => (
        <ColumnSelect
          key={f.key}
          fieldLabel={f.label}
          required={f.required}
          hint={f.hint}
          headers={headers}
          selected={get(f.key)}
          onSelect={(v) => set(f.key, v)}
          previewRows={previewRows}
        />
      ))}
    </div>
  );
}

// ─── Vista previa de filas ────────────────────────────────────────────────────

function PreviewTable({
  type,
  mapping,
  previewRows,
}: {
  type: "clients" | "closing";
  mapping: MappingValue;
  previewRows: Record<string, string>[];
}) {
  const fields = type === "clients" ? CLIENT_FIELDS : CLOSING_FIELDS;
  const m = mapping as Record<string, string | undefined>;

  // Solo mostrar columnas que tienen un mapeo
  const mapped = fields.filter((f) => m[f.key]);
  if (!mapped.length || !previewRows.length) return null;

  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-muted/50">
            {mapped.map((f) => (
              <th key={f.key} className="px-3 py-1.5 text-left font-medium text-muted-foreground whitespace-nowrap">
                {f.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {previewRows.map((row, i) => (
            <tr key={i} className="border-t border-border">
              {mapped.map((f) => (
                <td key={f.key} className="px-3 py-1.5 truncate max-w-[160px]">
                  {m[f.key] ? (row[m[f.key]!] ?? "—") : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Componente exportado ─────────────────────────────────────────────────────

export type ExcelColumnMapperValue = {
  clientsMapping?: Partial<ColumnMapping>;
  closingMapping?: Partial<ClosingColumnMapping>;
};

type ExcelColumnMapperProps = {
  clientsHeaders?: string[];
  clientsPreviewRows?: Record<string, string>[];
  closingHeaders?: string[];
  closingPreviewRows?: Record<string, string>[];
  value: ExcelColumnMapperValue;
  onChange: (v: ExcelColumnMapperValue) => void;
};

export function ExcelColumnMapper({
  clientsHeaders,
  clientsPreviewRows = [],
  closingHeaders,
  closingPreviewRows = [],
  value,
  onChange,
}: ExcelColumnMapperProps) {
  const [showClientsPreview, setShowClientsPreview] = useState(false);
  const [showClosingPreview, setShowClosingPreview] = useState(false);

  const hasClients = !!clientsHeaders?.length;
  const hasClosing = !!closingHeaders?.length;

  return (
    <div className="space-y-6">
      {hasClients && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Columnas de Clientes</h3>
            <button
              type="button"
              onClick={() => setShowClientsPreview((p) => !p)}
              className="text-xs text-primary hover:underline"
            >
              {showClientsPreview ? "Ocultar vista previa" : "Ver vista previa"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Indicá qué columna de tu archivo corresponde a cada campo de OTC.
          </p>
          <SingleMapper
            type="clients"
            headers={clientsHeaders}
            previewRows={clientsPreviewRows}
            value={value.clientsMapping ?? {}}
            onChange={(m) => onChange({ ...value, clientsMapping: m as Partial<ColumnMapping> })}
          />
          {showClientsPreview && (
            <PreviewTable
              type="clients"
              mapping={value.clientsMapping ?? {}}
              previewRows={clientsPreviewRows}
            />
          )}
        </section>
      )}

      {hasClients && hasClosing && (
        <hr className="border-border" />
      )}

      {hasClosing && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Columnas de Llamadas de cierre</h3>
            <button
              type="button"
              onClick={() => setShowClosingPreview((p) => !p)}
              className="text-xs text-primary hover:underline"
            >
              {showClosingPreview ? "Ocultar vista previa" : "Ver vista previa"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Indicá qué columna de tu archivo corresponde a cada campo de OTC.
          </p>
          <SingleMapper
            type="closing"
            headers={closingHeaders}
            previewRows={closingPreviewRows}
            value={value.closingMapping ?? {}}
            onChange={(m) => onChange({ ...value, closingMapping: m as Partial<ClosingColumnMapping> })}
          />
          {showClosingPreview && (
            <PreviewTable
              type="closing"
              mapping={value.closingMapping ?? {}}
              previewRows={closingPreviewRows}
            />
          )}
        </section>
      )}
    </div>
  );
}

// ─── Utilidades de validación ─────────────────────────────────────────────────

export function isMappingValid(
  type: "clients" | "closing",
  mapping: Partial<ColumnMapping> | Partial<ClosingColumnMapping> | undefined
): boolean {
  if (!mapping) return false;
  const m = mapping as Record<string, string | undefined>;
  if (type === "clients") return !!m.name;
  return !!m.leadName && !!m.scheduledAt;
}

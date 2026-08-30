"use client";

import { useState, useMemo } from "react";
import type { ColumnMapping } from "@/lib/clients/excel-parser";
import type { ClosingColumnMapping } from "@/lib/closing/excel-parser";
import type { SalesMetricsColumnMapping, FinanceMetricsColumnMapping } from "@/lib/metrics/excel-parser";
import { brand } from "@/lib/brand";

// ─── Definición de campos Limitless ─────────────────────────────────────────────────

type FieldDef = {
  key: string;
  label: string;
  required: boolean;
  hint?: string;
};

const CLIENT_FIELDS: FieldDef[] = [
  { key: "name",        label: "Nombre completo",   required: true },
  { key: "email",       label: "Email",             required: false },
  { key: "phone",       label: "Teléfono",          required: false },
  { key: "product",     label: "Producto / Plan",   required: false },
  { key: "totalAmount", label: "Monto pagado (CC)", required: false },
  { key: "joinDate",    label: "Fecha de inicio",   required: false },
];

const CLOSING_FIELDS: FieldDef[] = [
  { key: "leadName",    label: "Nombre prospecto", required: true },
  { key: "scheduledAt", label: "Fecha y hora",     required: true },
  { key: "email",       label: "Email",            required: false },
  { key: "status",      label: "Estado",           required: false, hint: "cerrado / no_cerrado / no_show" },
  { key: "amountClosed", label: "Monto cerrado",   required: false },
  { key: "notes",       label: "Notas",            required: false },
];

// Solo métricas primarias — Limitless calcula automáticamente: close rate, show rate,
// tasa agendamiento, inasistencias (si no se proveen), no cierres, tasa fantasma.
const SALES_METRICS_FIELDS: FieldDef[] = [
  { key: "period",         label: "Período / Semana", required: true,  hint: "ej. '2025-01-06' o 'Semana 1'" },
  { key: "leadsTotales",   label: "Leads totales",    required: false },
  { key: "agendasTotales", label: "Agendas totales",  required: false },
  { key: "asistencias",    label: "Show up",          required: false },
  { key: "inasistencias",  label: "No show up",       required: false },
  { key: "cierres",        label: "Cierres",          required: false },
  { key: "facturacion",    label: "Facturación",      required: false },
];

const FINANCE_METRICS_FIELDS: FieldDef[] = [
  { key: "period",        label: "Período / Mes",   required: true,  hint: "ej. '2025-01' o 'Enero 2025'" },
  { key: "facturacion",   label: "Facturación",      required: false },
  { key: "cashCollected", label: "Cash collected",   required: false },
  { key: "margen",        label: "Margen",           required: false, hint: "ej. 0.35 o 35%" },
  { key: "porCobrar",     label: "Por cobrar",       required: false },
  { key: "gastos",        label: "Gastos",           required: false },
];

// ─── Prop types ───────────────────────────────────────────────────────────────

export type MapperType = "clients" | "closing" | "salesMetrics" | "financeMetrics";

// Durante la edición UI los campos requeridos pueden estar vacíos → Partial
type MappingValue =
  | Partial<ColumnMapping>
  | Partial<ClosingColumnMapping>
  | Partial<SalesMetricsColumnMapping>
  | Partial<FinanceMetricsColumnMapping>;

type SingleMapperProps = {
  type: MapperType;
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
      {/* Campo Limitless */}
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
  const fields =
    type === "clients"       ? CLIENT_FIELDS :
    type === "closing"       ? CLOSING_FIELDS :
    type === "salesMetrics"  ? SALES_METRICS_FIELDS :
    FINANCE_METRICS_FIELDS;

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
  type: MapperType;
  mapping: MappingValue;
  previewRows: Record<string, string>[];
}) {
  const fields =
    type === "clients"       ? CLIENT_FIELDS :
    type === "closing"       ? CLOSING_FIELDS :
    type === "salesMetrics"  ? SALES_METRICS_FIELDS :
    FINANCE_METRICS_FIELDS;
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
  clientsMapping?:      Partial<ColumnMapping>;
  closingMapping?:      Partial<ClosingColumnMapping>;
  salesMetricsMapping?: Partial<SalesMetricsColumnMapping>;
  financeMetricsMapping?: Partial<FinanceMetricsColumnMapping>;
};

type SectionDef = {
  key: keyof ExcelColumnMapperValue;
  type: MapperType;
  label: string;
  headers?: string[];
  previewRows?: Record<string, string>[];
};

type ExcelColumnMapperProps = {
  clientsHeaders?: string[];
  clientsPreviewRows?: Record<string, string>[];
  closingHeaders?: string[];
  closingPreviewRows?: Record<string, string>[];
  salesMetricsHeaders?: string[];
  salesMetricsPreviewRows?: Record<string, string>[];
  financeMetricsHeaders?: string[];
  financeMetricsPreviewRows?: Record<string, string>[];
  value: ExcelColumnMapperValue;
  onChange: (v: ExcelColumnMapperValue) => void;
};

export function ExcelColumnMapper({
  clientsHeaders,
  clientsPreviewRows = [],
  closingHeaders,
  closingPreviewRows = [],
  salesMetricsHeaders,
  salesMetricsPreviewRows = [],
  financeMetricsHeaders,
  financeMetricsPreviewRows = [],
  value,
  onChange,
}: ExcelColumnMapperProps) {
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({});

  const sections: SectionDef[] = (
    [
      { key: "clientsMapping",       type: "clients",       label: "Clientes",                   headers: clientsHeaders,       previewRows: clientsPreviewRows },
      { key: "closingMapping",       type: "closing",       label: "Llamadas de cierre",          headers: closingHeaders,       previewRows: closingPreviewRows },
      { key: "salesMetricsMapping",  type: "salesMetrics",  label: "Métricas de ventas",          headers: salesMetricsHeaders,  previewRows: salesMetricsPreviewRows },
      { key: "financeMetricsMapping",type: "financeMetrics",label: "Métricas de finanzas",        headers: financeMetricsHeaders,previewRows: financeMetricsPreviewRows },
    ] as SectionDef[]
  ).filter((s) => !!s.headers?.length);

  const togglePreview = (key: string) =>
    setShowPreview((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6">
      {sections.map((s, i) => (
        <div key={s.key}>
          {i > 0 && <hr className="border-border mb-6" />}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Columnas de {s.label}</h3>
              <button
                type="button"
                onClick={() => togglePreview(s.key)}
                className="text-xs text-primary hover:underline"
              >
                {showPreview[s.key] ? "Ocultar vista previa" : "Ver vista previa"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Indicá qué columna de tu archivo corresponde a cada campo de {brand.name}.
            </p>
            <SingleMapper
              type={s.type}
              headers={s.headers!}
              previewRows={s.previewRows!}
              value={(value[s.key] ?? {}) as MappingValue}
              onChange={(m) => onChange({ ...value, [s.key]: m })}
            />
            {showPreview[s.key] && (
              <PreviewTable
                type={s.type}
                mapping={(value[s.key] ?? {}) as MappingValue}
                previewRows={s.previewRows!}
              />
            )}
          </section>
        </div>
      ))}
    </div>
  );
}

// ─── Utilidades de validación ─────────────────────────────────────────────────

export function isMappingValid(
  type: MapperType,
  mapping: MappingValue | undefined
): boolean {
  if (!mapping) return false;
  const m = mapping as Record<string, string | undefined>;
  if (type === "clients")       return !!m.name;
  if (type === "closing")       return !!m.leadName && !!m.scheduledAt;
  if (type === "salesMetrics")  return !!m.period;
  if (type === "financeMetrics") return !!m.period;
  return false;
}

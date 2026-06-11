"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@ai-coo/ui";
import type { SopStatus } from "@ai-coo/types";
import type { Sop, SopDepartment } from "@/types/sops";
import { SopGrid } from "./sop-grid";
import { SopsEmptyState } from "./sops-empty-state";

const DEPARTMENT_OPTIONS: { value: SopDepartment | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "sales", label: "Ventas" },
  { value: "delivery", label: "Delivery" },
  { value: "operations", label: "Operaciones" },
  { value: "marketing", label: "Marketing" },
  { value: "founder", label: "Founder" },
];

const STATUS_OPTIONS: { value: SopStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activo" },
  { value: "draft", label: "Borrador" },
  { value: "outdated", label: "Desactualizado" },
];

const selectClass =
  "h-9 rounded-md border border-border/60 bg-background px-3 text-sm text-foreground dark:border-white/[0.08] dark:bg-[#1A1A1A]";

export function SopLibrary({ sops }: { sops: Sop[] }) {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState<SopDepartment | "all">("all");
  const [status, setStatus] = useState<SopStatus | "all">("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sops.filter((sop) => {
      if (department !== "all" && sop.department !== department) return false;
      if (status !== "all" && sop.status !== status) return false;
      if (!query) return true;
      return (
        sop.title.toLowerCase().includes(query) ||
        sop.goal.toLowerCase().includes(query)
      );
    });
  }, [sops, search, department, status]);

  if (sops.length === 0) {
    return <SopsEmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className={selectClass}
          value={department}
          onChange={(e) =>
            setDepartment(e.target.value as SopDepartment | "all")
          }
          aria-label="Filtrar por departamento"
        >
          {DEPARTMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as SopStatus | "all")}
          aria-label="Filtrar por estado"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground dark:border-white/[0.08]">
          No hay SOPs que coincidan con los filtros seleccionados.
        </p>
      ) : (
        <SopGrid sops={filtered} />
      )}
    </div>
  );
}

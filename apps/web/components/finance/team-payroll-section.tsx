"use client";

import { useTransition, useState } from "react";
import { RefreshCw, UserCircle2, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { cn, GlassPanel, Badge } from "@ai-coo/ui";
import { formatMoney } from "@/lib/finance/format";
import { computeTeamPayrollAction, type MemberPayrollResult } from "@/app/finance/actions";
import { useFinanceData } from "@/providers";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function currentMonthLabel() {
  const d = new Date();
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function MemberCard({ result }: { result: MemberPayrollResult }) {
  const initials = result.memberName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const hasCommission = result.commissionAmount > 0;
  const hasFixed = result.fixedAmount > 0;

  return (
    <GlassPanel className="p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-tight">{result.memberName}</p>
          <p className="text-xs text-muted-foreground">{result.roleLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums text-foreground">
            {formatMoney(result.total)}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
            este mes
          </p>
        </div>
      </div>

      {/* Breakdown bar */}
      {(hasFixed || hasCommission) && result.total > 0 && (
        <div className="space-y-1.5">
          <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
            {hasFixed && (
              <div
                className="h-full bg-blue-500/70 transition-all"
                style={{ width: `${(result.fixedAmount / result.total) * 100}%` }}
              />
            )}
            {hasCommission && (
              <div
                className="h-full bg-emerald-500/70 transition-all"
                style={{ width: `${(result.commissionAmount / result.total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {hasFixed && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500/70" />
                Fijo {formatMoney(result.fixedAmount)}
              </span>
            )}
            {hasCommission && (
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/70" />
                Comisión {formatMoney(result.commissionAmount)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Commission breakdown detail */}
      {result.breakdown && result.breakdown !== "Estimación manual" && (
        <p className="rounded-lg bg-muted/30 px-3 py-2 text-xs text-muted-foreground leading-snug">
          {result.breakdown}
        </p>
      )}
    </GlassPanel>
  );
}

export function TeamPayrollSection() {
  const { teamCompensation } = useFinanceData();
  const [results, setResults] = useState<MemberPayrollResult[] | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const monthLabel = currentMonthLabel();
  const hasMembers = teamCompensation.length > 0;

  function handleCompute() {
    setError(null);
    startTransition(async () => {
      try {
        const data = await computeTeamPayrollAction();
        setResults(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al calcular");
      }
    });
  }

  const totalPayroll = results?.reduce((s, r) => s + r.total, 0) ?? 0;
  const totalFixed = results?.reduce((s, r) => s + r.fixedAmount, 0) ?? 0;
  const totalCommission = results?.reduce((s, r) => s + r.commissionAmount, 0) ?? 0;

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Pagos del equipo</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cálculo automático de compensación para {monthLabel}
          </p>
        </div>
        <button
          type="button"
          disabled={pending || !hasMembers}
          onClick={handleCompute}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            "disabled:opacity-40 disabled:pointer-events-none"
          )}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", pending && "animate-spin")} />
          {pending ? "Calculando…" : results ? "Recalcular" : "Calcular mes"}
        </button>
      </div>

      {/* Empty state */}
      {!hasMembers && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/50 py-8 text-center">
          <UserCircle2 className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Sin miembros de equipo configurados</p>
          <p className="text-xs text-muted-foreground/70">
            Añadí miembros en la sección de abajo para calcular su compensación
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Summary strip */}
      {results && results.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <GlassPanel className="p-3 text-center">
            <Wallet className="mx-auto h-4 w-4 text-muted-foreground mb-1" />
            <p className="text-lg font-bold tabular-nums">{formatMoney(totalPayroll)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total equipo</p>
          </GlassPanel>
          <GlassPanel className="p-3 text-center">
            <div className="mx-auto mb-1 h-1.5 w-6 rounded-full bg-blue-500/70" />
            <p className="text-lg font-bold tabular-nums">{formatMoney(totalFixed)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Salarios fijos</p>
          </GlassPanel>
          <GlassPanel className="p-3 text-center">
            <TrendingUp className="mx-auto h-4 w-4 text-emerald-500 mb-1" />
            <p className="text-lg font-bold tabular-nums">{formatMoney(totalCommission)}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Comisiones</p>
          </GlassPanel>
        </div>
      )}

      {/* Member cards */}
      {results && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((r) => (
            <MemberCard key={r.memberId} result={r} />
          ))}
        </div>
      )}
    </section>
  );
}

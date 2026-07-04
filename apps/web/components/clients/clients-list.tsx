"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Badge, Button, StaggerFade, StaggerFadeItem } from "@ai-coo/ui";
import { Settings2, Star } from "lucide-react";
import { getClientsTableEnrichmentAction } from "@/app/clients/plan-duration-actions";
import { FilterPills } from "@/components/marketing/filter-pills";
import {
  computeOutstandingBalance,
  computeRemainingProgramDays,
  distinctPlanNames,
  findPlanDuration,
  formatRemainingDays,
  getClientPlanName,
} from "@/lib/clients/plan-utils";
import { paths } from "@/routes";
import type { Client, ClientStatus } from "@/types/clients";
import type { PlanDuration } from "@/types/plan-durations";
import { ImportClientsDialog } from "./import-clients-dialog";
import { PlanDurationsDialog } from "./plan-durations-dialog";

const STATUS_LABEL: Record<ClientStatus, string> = {
  pending_onboarding: "Realizar onboarding",
  onboarding_done: "Onboarding realizado",
  active: "Activo",
  success_case: "Caso de éxito",
};

const STATUS_FILTERS: { id: ClientStatus | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pending_onboarding", label: "Pendiente onboarding" },
  { id: "onboarding_done", label: "Onboarding hecho" },
  { id: "active", label: "Activos" },
  { id: "success_case", label: "Caso de éxito" },
];

const PAYMENT_LABEL = {
  upfront: "Upfront",
  installments: "Cuotas",
  upfront_fee: "Upfront + fee",
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`;
}

export function ClientsList({ clients }: { clients: Client[] }) {
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [paidByClientId, setPaidByClientId] = useState<Record<string, number>>({});
  const [planDurations, setPlanDurations] = useState<PlanDuration[]>([]);
  const [isFounder, setIsFounder] = useState(false);
  const [durationsOpen, setDurationsOpen] = useState(false);
  const [loadingEnrichment, startLoad] = useTransition();

  useEffect(() => {
    startLoad(async () => {
      const data = await getClientsTableEnrichmentAction();
      setPaidByClientId(data.paidByClientId);
      setPlanDurations(data.planDurations);
      setIsFounder(data.isFounder);
    });
  }, [clients]);

  const planOptions = useMemo(() => {
    const names = distinctPlanNames(clients);
    return [
      { value: "all", label: "Todos los planes" },
      ...names.map((name) => ({ value: name, label: name })),
    ];
  }, [clients]);

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      if (statusFilter !== "all" && client.status !== statusFilter) return false;
      if (planFilter !== "all") {
        const plan = getClientPlanName(client);
        if (plan !== planFilter) return false;
      }
      return true;
    });
  }, [clients, statusFilter, planFilter]);

  const allPlanNames = useMemo(() => distinctPlanNames(clients), [clients]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterPills
            options={STATUS_FILTERS.map((f) => ({ value: f.id, label: f.label }))}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as ClientStatus | "all")}
          />
          {planOptions.length > 1 ? (
            <select
              className="h-9 rounded-md border border-border bg-background px-3 text-sm dark:border-white/[0.08] dark:bg-[#1A1A1A]"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              {planOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isFounder ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setDurationsOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
              Duraciones de planes
            </Button>
          ) : null}
          <ImportClientsDialog />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Días restantes</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Adeudado en cuotas</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <StaggerFade as="tbody">
            {filtered.map((client) => {
              const planName = getClientPlanName(client);
              const duration = findPlanDuration(planName, planDurations);
              const remainingDays = computeRemainingProgramDays(
                client.joinDate,
                duration?.durationDays
              );
              const paid = paidByClientId[client.id] ?? 0;
              const owed = computeOutstandingBalance(client, paid);

              return (
                <StaggerFadeItem
                  as="tr"
                  key={client.id}
                  className="border-b border-border/50 transition-colors hover:bg-muted/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{client.name}</span>
                      {client.isSuccessCase && (
                        <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {planName ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {loadingEnrichment && !duration
                      ? "…"
                      : formatRemainingDays(remainingDays)}
                  </td>
                  <td className="px-4 py-3">{PAYMENT_LABEL[client.paymentType]}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {loadingEnrichment ? "…" : formatCurrency(owed)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatCurrency(client.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{STATUS_LABEL[client.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={paths.platform.clients.detail(client.id)}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </StaggerFadeItem>
              );
            })}
          </StaggerFade>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay clientes con este filtro.
          </p>
        )}
      </div>

      {isFounder ? (
        <PlanDurationsDialog
          open={durationsOpen}
          onOpenChange={setDurationsOpen}
          planNames={allPlanNames}
          durations={planDurations}
          onUpdated={setPlanDurations}
        />
      ) : null}
    </div>
  );
}

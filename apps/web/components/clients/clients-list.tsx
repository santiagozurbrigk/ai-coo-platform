"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, StaggerFade, StaggerFadeItem } from "@ai-coo/ui";
import { AlertTriangle, BookOpen, CalendarCheck, MoonStar, Route, Settings2, SlidersHorizontal, Star, Trash2, Trophy } from "lucide-react";
import { assignClientPlanAction, deleteClientAction } from "@/app/clients/actions";
import { listPlansAction } from "@/app/clients/plan-actions";
import { getClientsTableEnrichmentAction } from "@/app/clients/plan-duration-actions";
import { getClientsDiscordActivityAction } from "@/app/discord/actions";
import type { ClientActivity } from "@/lib/discord/activity";
import { getClientsJourneyStatusAction } from "@/app/clients/checkpoint-derived-actions";
import { FilterPills } from "@/components/marketing/filter-pills";
import {
  computeOutstandingBalance,
  computeRemainingProgramDays,
  distinctPlanNames,
  formatRemainingDays,
  getClientPlanName,
} from "@/lib/clients/plan-utils";
import { paths } from "@/routes";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import type { Client, ClientStatus } from "@/types/clients";
import type { Plan } from "@/types/plans";
import type { PlanDuration } from "@/types/plan-durations";
import type { ClientJourneyStatus } from "@/types/checkpoints";
import { fieldOptionColorVar } from "@/lib/custom-fields";
import { formatOverdue } from "@/lib/checkpoints";
import { PlanManagerDialog } from "./plan-manager-dialog";

const STATUS_LABEL: Record<ClientStatus, string> = {
  pending_onboarding: "Realizar onboarding",
  onboarding_done: "Onboarding realizado",
  active: "Activo",
  success_case: "Caso de éxito",
};

type ClientListFilter = ClientStatus | "all" | "stalled";

const STATUS_FILTERS: { id: ClientListFilter; label: string }[] = [
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

function RemainingDaysBadge({
  days,
  loading,
  hasDuration,
}: {
  days: number | null;
  loading: boolean;
  hasDuration: boolean;
}) {
  if (loading && !hasDuration) {
    return <span className="text-muted-foreground">…</span>;
  }

  const text = formatRemainingDays(days);

  let dotClass: string | null = null;
  if (days !== null) {
    if (days < 0) {
      dotClass = "bg-muted-foreground/40";
    } else if (days < 15) {
      dotClass = "bg-red-500";
    } else if (days < 30) {
      dotClass = "bg-amber-400";
    } else {
      dotClass = "bg-green-500";
    }
  }

  return (
    <div className="flex items-center gap-2">
      {dotClass !== null ? (
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass}`}
          aria-hidden
        />
      ) : null}
      <span className="text-muted-foreground">{text}</span>
    </div>
  );
}

// ── Diálogo de confirmación de eliminación ─────────────────────────────────

function DeleteClientDialog({
  client,
  onConfirm,
  onCancel,
  pending,
}: {
  client: Client;
  onConfirm: () => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <Dialog open onOpenChange={(o: boolean) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Eliminar cliente</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          ¿Estás seguro que querés eliminar a{" "}
          <span className="font-medium text-foreground">{client.name}</span>? Esta acción no se puede deshacer.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={pending}>
            {pending ? "Eliminando…" : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Diálogo de asignación de plan ──────────────────────────────────────────

function AssignPlanDialog({
  client,
  plans,
  onConfirm,
  onCancel,
  pending,
}: {
  client: Client;
  plans: Plan[];
  onConfirm: (planId: string | null) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(client.planId ?? "");

  return (
    <Dialog open onOpenChange={(o: boolean) => { if (!o) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Asignar plan a {client.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Seleccioná el plan contratado por este cliente.
          </p>
          <select
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={selectedPlanId}
            onChange={(e) => setSelectedPlanId(e.target.value)}
            disabled={pending}
          >
            <option value="">Sin plan asignado</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.durationDays ? ` (${p.durationDays} días)` : ""}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={pending}>
            Cancelar
          </Button>
          <Button
            onClick={() => onConfirm(selectedPlanId || null)}
            disabled={pending}
          >
            {pending ? "Guardando…" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Componente principal ───────────────────────────────────────────────────

export function ClientsList({ clients }: { clients: Client[] }) {
  const { refreshClients } = usePlatformData();
  const { push } = useToast();
  const [statusFilter, setStatusFilter] = useState<ClientListFilter>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [paidByClientId, setPaidByClientId] = useState<Record<string, number>>({});
  const [planDurations, setPlanDurations] = useState<PlanDuration[]>([]);
  const [isFounder, setIsFounder] = useState(false);
  /** D2 · Actividad en Discord por cliente, para la señal de silencio. */
  const [discordActivity, setDiscordActivity] = useState<Record<string, ClientActivity>>({});
  /** C3 · Fase actual y "trabado" por cliente. Derivado, no guardado. */
  const [journey, setJourney] = useState<Record<string, ClientJourneyStatus>>({});
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansOpen, setPlansOpen] = useState(false);
  const [loadingEnrichment, startLoad] = useTransition();
  const [pending, startTransition] = useTransition();

  // Diálogos de acción por cliente
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [assignPlanTarget, setAssignPlanTarget] = useState<Client | null>(null);

  useEffect(() => {
    startLoad(async () => {
      const [enrichment, fetchedPlans, journeyStatus, activity] = await Promise.all([
        getClientsTableEnrichmentAction(),
        listPlansAction(),
        getClientsJourneyStatusAction(),
        getClientsDiscordActivityAction(),
      ]);
      setDiscordActivity(activity);
      setPaidByClientId(enrichment.paidByClientId);
      setPlanDurations(enrichment.planDurations);
      setIsFounder(enrichment.isFounder);
      setPlans(fetchedPlans);
      setJourney(journeyStatus);
    });
  }, [clients]);

  const planOptions = useMemo(() => {
    const names = distinctPlanNames(clients);
    return [
      { value: "all", label: "Todos los planes" },
      ...names.map((name) => ({ value: name, label: name })),
    ];
  }, [clients]);

  const stalledCount = useMemo(
    () => Object.values(journey).filter((entry) => entry.stalled).length,
    [journey]
  );

  /** ¿Hay recorrido configurado? Sin él la columna no se muestra. */
  const hasJourney = Object.keys(journey).length > 0;

  const filtered = useMemo(() => {
    return clients.filter((client) => {
      // "Trabado" no es un estado del cliente: es una vista derivada del
      // recorrido, así que se filtra aparte de los cuatro estados.
      if (statusFilter === "stalled") {
        if (!journey[client.id]?.stalled) return false;
      } else if (statusFilter !== "all" && client.status !== statusFilter) {
        return false;
      }
      if (planFilter !== "all") {
        const plan = getClientPlanName(client);
        if (plan !== planFilter) return false;
      }
      return true;
    });
  }, [clients, statusFilter, planFilter, journey]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    startTransition(async () => {
      try {
        await deleteClientAction(target.id);
        await refreshClients();
        push({ title: `Cliente "${target.name}" eliminado`, variant: "success" });
      } catch (e) {
        push({
          title: "No se pudo eliminar el cliente",
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  };

  const handleAssignPlanConfirm = (planId: string | null) => {
    if (!assignPlanTarget) return;
    const target = assignPlanTarget;
    setAssignPlanTarget(null);
    startTransition(async () => {
      try {
        await assignClientPlanAction(target.id, planId);
        await refreshClients();
        push({ title: "Plan asignado", variant: "success" });
      } catch (e) {
        push({
          title: "No se pudo asignar el plan",
          description: e instanceof Error ? e.message : undefined,
        });
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <FilterPills
            options={[
              ...STATUS_FILTERS,
              ...(stalledCount > 0
                ? [{ id: "stalled" as const, label: `Trabados (${stalledCount})` }]
                : []),
            ].map((f) => ({ value: f.id, label: f.label }))}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as ClientListFilter)}
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
        {isFounder ? (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setPlansOpen(true)}
            >
              <Settings2 className="h-4 w-4" />
              Crear planes
            </Button>
            {/*
              C0 · Único acceso a la configuración de columnas configurables.
              Va acá y no en el grupo "Configuración" de la navegación: la barra
              superior saltea ese grupo entero, así que desde el escritorio no se
              llegaba.
            */}
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={paths.platform.clients.weeklyReview}>
                <CalendarCheck className="h-4 w-4" />
                Revisión semanal
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={paths.platform.clients.wins}>
                <Trophy className="h-4 w-4" />
                Wins
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={paths.platform.clients.checkpoints}>
                <Route className="h-4 w-4" />
                Recorrido del cliente
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={paths.platform.clients.customFields}>
                <SlidersHorizontal className="h-4 w-4" />
                Campos personalizados
              </Link>
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Días restantes</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Adeudado</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              {hasJourney ? (
                <th className="px-4 py-3 font-medium">Recorrido</th>
              ) : null}
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <StaggerFade as="tbody">
            {filtered.map((client) => {
              const planName = getClientPlanName(client);
              // Usar plan estructurado si está asignado, o buscar por nombre en planDurations
              const assignedPlan = client.planId
                ? plans.find((p) => p.id === client.planId)
                : undefined;
              const durationDays = assignedPlan?.durationDays ?? (() => {
                const pd = planDurations.find(
                  (d) => d.planName.toLowerCase() === (planName ?? "").toLowerCase()
                );
                return pd?.durationDays;
              })();
              const remainingDays = computeRemainingProgramDays(
                client.joinDate,
                durationDays
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
                    <div className="flex items-center gap-1.5">
                      <span>{assignedPlan?.name ?? planName ?? "—"}</span>
                      {plans.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground/60 hover:text-primary"
                          title="Modificar plan"
                          onClick={() => setAssignPlanTarget(client)}
                          disabled={pending}
                        >
                          <BookOpen className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <RemainingDaysBadge
                      days={remainingDays}
                      loading={loadingEnrichment}
                      hasDuration={!!durationDays}
                    />
                  </td>
                  <td className="px-4 py-3">{PAYMENT_LABEL[client.paymentType]}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {loadingEnrichment ? "…" : formatCurrency(owed)}
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatCurrency(client.totalAmount)}
                  </td>
                  {hasJourney ? (
                    <td className="px-4 py-3">
                      <JourneyCell status={journey[client.id]} />
                    </td>
                  ) : null}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">{STATUS_LABEL[client.status]}</Badge>
                      {/* D2 · Silencio en Discord: se avisa donde ya se mira el estado. */}
                      {discordActivity[client.id]?.isSilent ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-warning/40 px-1.5 py-0.5 text-[10px] text-warning"
                          title={`Sin escribir en Discord hace ${discordActivity[client.id]?.daysSinceLastMessage} días`}
                        >
                          <MoonStar className="h-2.5 w-2.5" />
                          {discordActivity[client.id]?.daysSinceLastMessage}d
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={paths.platform.clients.detail(client.id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Ver detalle
                      </Link>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground/50 hover:text-destructive"
                        title="Eliminar cliente"
                        onClick={() => setDeleteTarget(client)}
                        disabled={pending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      {/* Diálogo de gestión de planes */}
      {isFounder ? (
        <PlanManagerDialog
          open={plansOpen}
          onOpenChange={setPlansOpen}
          plans={plans}
          onUpdated={setPlans}
        />
      ) : null}

      {/* Confirmación de eliminación */}
      {deleteTarget ? (
        <DeleteClientDialog
          client={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          pending={pending}
        />
      ) : null}

      {/* Asignar plan */}
      {assignPlanTarget ? (
        <AssignPlanDialog
          client={assignPlanTarget}
          plans={plans}
          onConfirm={handleAssignPlanConfirm}
          onCancel={() => setAssignPlanTarget(null)}
          pending={pending}
        />
      ) : null}
    </div>
  );
}

/**
 * C3 · La fase del cliente y si está trabado.
 *
 * Un cliente sin ningún hito registrado muestra un guion, no "Fase 1": no
 * empezó el recorrido, y decir lo contrario sería inventar.
 */
function JourneyCell({ status }: { status: ClientJourneyStatus | undefined }) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  const overdue = formatOverdue(status);

  return (
    <div className="space-y-0.5">
      {status.currentStageName ? (
        <span className="inline-flex items-center gap-1.5 text-xs">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor: status.currentStageColor
                ? fieldOptionColorVar(status.currentStageColor)
                : undefined,
            }}
          />
          {status.currentStageName}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">Sin empezar</span>
      )}

      {overdue ? (
        <span className="flex items-center gap-1 text-[11px] text-destructive">
          <AlertTriangle className="h-3 w-3" />
          {overdue}
        </span>
      ) : (
        <span className="block text-[11px] text-muted-foreground">
          {status.reached} de {status.total}
        </span>
      )}
    </div>
  );
}

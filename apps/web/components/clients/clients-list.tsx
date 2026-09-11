"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Badge, Button, Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, StaggerFade, StaggerFadeItem } from "@ai-coo/ui";
import { AlertTriangle, CalendarCheck, MoonStar, Receipt, Route, SlidersHorizontal, Star, Trash2, Trophy } from "lucide-react";
import { deleteClientAction } from "@/app/clients/actions";
import { getClientsDiscordActivityAction } from "@/app/discord/actions";
import type { ClientActivity } from "@/lib/discord/activity";
import { getClientsJourneyStatusAction } from "@/app/clients/checkpoint-derived-actions";
import { FilterPills } from "@/components/marketing/filter-pills";
import { paths } from "@/routes";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import type { Client, ClientStatus } from "@/types/clients";
import type { ClientJourneyStatus } from "@/types/checkpoints";
import { fieldOptionColorVar } from "@/lib/custom-fields";
import { formatOverdue } from "@/lib/checkpoints";
import { NewClientDialog } from "@/components/clients/new-client-dialog";
import { ImportClientsDialog } from "@/components/clients/import-clients-dialog";
import { useModuleAccess } from "@/providers/permissions-provider";

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

// ── Componente principal ───────────────────────────────────────────────────

/**
 * La lista de clientes — el tablero de **entrega**.
 *
 * ⭐ Lo financiero (plan, días restantes, tipo de pago, adeudado y monto) se
 * mudó a `/sales/cobros`. Acá quedó la pregunta que hace quien acompaña al
 * cliente: dónde está parado en su recorrido y si se movió. Mezclar las dos
 * hacía que la tabla respondiera dos preguntas a medias.
 */
export function ClientsList({ clients }: { clients: Client[] }) {
  const { refreshClients } = usePlatformData();
  const { push } = useToast();
  const [statusFilter, setStatusFilter] = useState<ClientListFilter>("all");
  /**
   * ⭐ Quién puede gestionar clientes: el fundador **o** cualquiera cuyo rol
   * tenga acceso total al módulo.
   *
   * Antes esto miraba sólo `isFounder`, así que un miembro con un rol que le
   * daba "acceso total a Clientes" entraba y veía una lista pelada: sin planes,
   * sin revisión semanal, sin wins, sin recorrido y sin campos. El permiso
   * existía, se podía configurar, y no servía para nada.
   *
   * Un permiso que la pantalla ignora es peor que no tenerlo: hace creer que el
   * acceso está dado. `useModuleAccess` ya devuelve "full" para el fundador,
   * así que alcanza con preguntar una sola cosa.
   */
  const puedeGestionar = useModuleAccess("clients") === "full";
  /** ¿Puede además ver los cobros? El atajo no se ofrece si no va a poder entrar. */
  const puedeVerCobros = useModuleAccess("sales") !== "none";
  /** D2 · Actividad en Discord por cliente, para la señal de silencio. */
  const [discordActivity, setDiscordActivity] = useState<Record<string, ClientActivity>>({});
  /** C3 · Fase actual y "trabado" por cliente. Derivado, no guardado. */
  const [journey, setJourney] = useState<Record<string, ClientJourneyStatus>>({});
  const [, startLoad] = useTransition();
  const [pending, startTransition] = useTransition();

  // Diálogos de acción por cliente
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);

  useEffect(() => {
    startLoad(async () => {
      const [journeyStatus, activity] = await Promise.all([
        getClientsJourneyStatusAction(),
        getClientsDiscordActivityAction(),
      ]);
      setDiscordActivity(activity);
      setJourney(journeyStatus);
    });
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
      return true;
    });
  }, [clients, statusFilter, journey]);

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
        </div>
        {puedeGestionar ? (
          <div className="flex flex-wrap items-center gap-2">
            <NewClientDialog />
            <ImportClientsDialog />
            {/*
              ⭐ El atajo a Cobros existe porque el monto y el adeudado se
              mostraban acá hasta hoy. Sin él, quien los buscaba en esta tabla
              concluiría que se perdieron.
            */}
            {puedeVerCobros ? (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href={paths.platform.sales.cobros}>
                  <Receipt className="h-4 w-4" />
                  Cobros
                </Link>
              </Button>
            ) : null}
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
              {hasJourney ? (
                <th className="px-4 py-3 font-medium">Recorrido</th>
              ) : null}
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <StaggerFade as="tbody">
            {filtered.map((client) => (
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
            ))}
          </StaggerFade>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay clientes con este filtro.
          </p>
        )}
      </div>

      {/* Confirmación de eliminación */}
      {deleteTarget ? (
        <DeleteClientDialog
          client={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
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

"use client";

/**
 * La lista de clientes — el tablero de **entrega**.
 *
 * ⭐ Responde una sola pregunta, de un vistazo: **dónde está parado cada cliente
 * y qué le falta**. Etapa, próxima tarea con su fecha límite, objetivo y cuánto
 * le queda para cerrar la etapa.
 *
 * Lo financiero (plan, días de programa, pago, adeudado, monto) se mudó a
 * `/sales/cobros` el 2026-09-11. Mezclarlos hacía que la tabla respondiera dos
 * preguntas a medias, y son preguntas que muchas veces hacen dos personas
 * distintas.
 *
 * ⭐ Los filtros se arman con los datos, no con el catálogo. Medido en
 * producción el 2026-09-21: 306 de 307 clientes en «Activo», cero en
 * «Onboarding hecho», cero en «Caso de éxito». Una fila de cinco pastillas para
 * filtrar una dimensión donde el 99,7% es un solo valor no filtra nada, y la
 * columna «Estado» que decía «Activo» 306 veces tampoco. Los estados siguen
 * existiendo —una organización que recién carga clientes va a ver «Pendiente de
 * onboarding (12)»—, pero una pastilla sólo aparece cuando hay alguien detrás.
 */

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  StaggerFade,
  StaggerFadeItem,
} from "@ai-coo/ui";
import {
  AlertTriangle,
  CalendarCheck,
  Check,
  ChevronDown,
  HelpCircle,
  MoonStar,
  Receipt,
  Route,
  Search,
  Settings2,
  SlidersHorizontal,
  Star,
  Trash2,
  Trophy,
} from "lucide-react";
import { deleteClientAction } from "@/app/clients/actions";
import { getClientsDiscordActivityAction } from "@/app/discord/actions";
import type { ClientActivity } from "@/lib/discord/activity";
import {
  getClientsBoardAction,
  type ClientsBoardData,
} from "@/app/clients/clients-board-actions";
import {
  isConfirmedResolution,
  type LastOneOnOne,
} from "@/lib/fathom/one-on-one-types";
import { recordCheckpointAction } from "@/app/clients/checkpoint-event-actions";
import { FilterPills } from "@/components/marketing/filter-pills";
import { FieldValueCell } from "@/components/clients/custom-fields/field-value-cell";
import { RecordCheckpointDialog } from "@/components/clients/checkpoints/record-checkpoint-dialog";
import { paths } from "@/routes";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import type { Client, ClientStatus } from "@/types/clients";
import type { Checkpoint, ClientJourneyStatus } from "@/types/checkpoints";
import { activeFields, fieldOptionColorVar } from "@/lib/custom-fields";
import { formatDueDate, formatOverdue, resolveMetricSchema } from "@/lib/checkpoints";
import { useModuleAccess } from "@/providers/permissions-provider";
import { NewClientDialog } from "@/components/clients/new-client-dialog";
import { ImportClientsDialog } from "@/components/clients/import-clients-dialog";
import { cn } from "@/lib/utils";

/**
 * Los estados que **vale la pena señalar** en la fila, con su etiqueta.
 *
 * «Activo» no está a propósito: es el estado normal de un cliente en programa,
 * y una etiqueta que dice lo normal en cada fila es ruido. Lo que se marca es
 * la excepción: el que todavía no arrancó y el que ya es caso de éxito.
 */
const STATUS_DESTACADO: Partial<Record<ClientStatus, { label: string; filtro: string }>> = {
  pending_onboarding: { label: "Pendiente de onboarding", filtro: "Pendientes de onboarding" },
  onboarding_done: { label: "Onboarding hecho", filtro: "Onboarding hecho" },
  success_case: { label: "Caso de éxito", filtro: "Casos de éxito" },
};

type ClientListFilter = ClientStatus | "all" | "stalled" | "silent";

type ClientListSort = "recent" | "name" | "last_one_on_one";

const SORT_LABEL: Record<ClientListSort, string> = {
  recent: "Más recientes",
  name: "Nombre A–Z",
  last_one_on_one: "Última 1-1",
};

const EMPTY_BOARD: ClientsBoardData = {
  journey: {},
  checkpoints: [],
  checkpointFields: [],
  clientFields: [],
  lastOneOnOne: {},
};

/** Normaliza para buscar: sin tildes, sin mayúsculas. «Gómez» encuentra «gomez». */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

// ── Componente principal ───────────────────────────────────────────────────

export function ClientsList({ clients }: { clients: Client[] }) {
  const { refreshClients } = usePlatformData();
  const { push } = useToast();
  const router = useRouter();
  const [filter, setFilter] = useState<ClientListFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ClientListSort>("recent");
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
  const [board, setBoard] = useState<ClientsBoardData>(EMPTY_BOARD);
  const [, startLoad] = useTransition();
  const [pending, startTransition] = useTransition();

  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  /** El hito que se está registrando desde la tabla, cuando pide métricas. */
  const [recording, setRecording] = useState<{
    client: Client;
    checkpoint: Checkpoint;
  } | null>(null);
  const [recordError, setRecordError] = useState<string | null>(null);

  /**
   * El tablero se vuelve a pedir cada vez que cambia la lista de clientes.
   *
   * ⭐ De ahí que los handlers llamen sólo a `refreshClients()`: eso trae una
   * lista nueva del servidor, cambia la identidad del arreglo y este efecto
   * vuelve a correr. Pedir el tablero además a mano sería el mismo fetch dos
   * veces por cada check marcado.
   */
  useEffect(() => {
    startLoad(async () => {
      const [boardData, activity] = await Promise.all([
        getClientsBoardAction(),
        getClientsDiscordActivityAction(),
      ]);
      setBoard(boardData);
      setDiscordActivity(activity);
    });
  }, [clients]);

  const { journey, checkpoints, checkpointFields, clientFields, lastOneOnOne } = board;

  const checkpointById = useMemo(
    () => new Map(checkpoints.map((checkpoint) => [checkpoint.id, checkpoint])),
    [checkpoints]
  );

  /**
   * Las columnas configurables que se muestran en la tabla.
   *
   * ⭐ Son las que la organización configuró, no una lista fija: si configuró
   * sólo "Objetivo general", se ve una columna; si configuró tres, tres. La
   * tabla la decide la configuración, igual que en el tracker de wins.
   */
  const customColumns = useMemo(() => activeFields(clientFields), [clientFields]);

  /** ¿Hay recorrido configurado? Sin él, sus tres columnas no se muestran. */
  const hasJourney = Object.keys(journey).length > 0;

  /**
   * Cuántos clientes hay detrás de cada filtro posible.
   *
   * ⭐ Es lo que decide qué pastillas se dibujan: una con cero atrás no aparece.
   * Y el número va en la pastilla porque es la respuesta a la pregunta que
   * hace que alguien la toque: "¿cuántos están trabados?".
   */
  const conteos = useMemo(() => {
    const porEstado: Partial<Record<ClientStatus, number>> = {};
    let stalled = 0;
    let silent = 0;
    for (const client of clients) {
      porEstado[client.status] = (porEstado[client.status] ?? 0) + 1;
      if (journey[client.id]?.stalled) stalled += 1;
      if (discordActivity[client.id]?.isSilent) silent += 1;
    }
    return { porEstado, stalled, silent };
  }, [clients, journey, discordActivity]);

  const filtros = useMemo(() => {
    const lista: { value: ClientListFilter; label: string }[] = [
      { value: "all", label: `Todos (${clients.length})` },
    ];
    if (conteos.stalled > 0) {
      lista.push({ value: "stalled", label: `Trabados (${conteos.stalled})` });
    }
    if (conteos.silent > 0) {
      lista.push({ value: "silent", label: `En silencio (${conteos.silent})` });
    }
    for (const [status, def] of Object.entries(STATUS_DESTACADO)) {
      const n = conteos.porEstado[status as ClientStatus] ?? 0;
      if (n > 0) lista.push({ value: status as ClientStatus, label: `${def.filtro} (${n})` });
    }
    return lista;
  }, [clients.length, conteos]);

  // Si el filtro elegido se quedó sin gente (se borró el último), vuelve a Todos.
  useEffect(() => {
    if (!filtros.some((f) => f.value === filter)) setFilter("all");
  }, [filtros, filter]);

  const visibles = useMemo(() => {
    const q = normalizar(query);
    const lista = clients.filter((client) => {
      if (filter === "stalled" && !journey[client.id]?.stalled) return false;
      if (filter === "silent" && !discordActivity[client.id]?.isSilent) return false;
      if (filter !== "all" && filter !== "stalled" && filter !== "silent") {
        if (client.status !== filter) return false;
      }
      if (q) {
        const pajar = normalizar(
          [client.name, client.nickname, client.email, client.offeredProduct]
            .filter(Boolean)
            .join(" ")
        );
        if (!pajar.includes(q)) return false;
      }
      return true;
    });

    const porNombre = (a: Client, b: Client) => a.name.localeCompare(b.name, "es");
    if (sort === "name") return lista.sort(porNombre);
    if (sort === "last_one_on_one") {
      // Los que tienen sesión, de la más reciente a la más vieja; los que no, al
      // final por nombre: un guion no es "más viejo", es "no hay".
      return lista.sort((a, b) => {
        const da = lastOneOnOne[a.id]?.date ?? "";
        const db = lastOneOnOne[b.id]?.date ?? "";
        if (da !== db) return db.localeCompare(da);
        return porNombre(a, b);
      });
    }
    return lista.sort((a, b) => {
      const d = b.joinDate.localeCompare(a.joinDate);
      return d !== 0 ? d : porNombre(a, b);
    });
  }, [clients, filter, query, sort, journey, discordActivity, lastOneOnOne]);

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

  /**
   * ⭐ Marcar la próxima tarea desde la tabla.
   *
   * Si el hito **no pide métricas**, se registra de una: ese es el caso que
   * hace útil el check en la fila. Si pide, abre el mismo diálogo que la ficha
   * del cliente — no se saltean las validaciones de C0 para que algo entre en
   * una celda. Un hito registrado sin las métricas que pedía es un hito a medias
   * que después nadie completa.
   */
  function toggleNextCheckpoint(client: Client, status: ClientJourneyStatus) {
    if (!status.nextCheckpointId) return;
    const checkpoint = checkpointById.get(status.nextCheckpointId);
    if (!checkpoint) return;

    const asksMetrics = resolveMetricSchema(
      checkpoint.metricSchema,
      checkpointFields
    ).some((entry) => entry.field !== null);

    if (asksMetrics) {
      setRecordError(null);
      setRecording({ client, checkpoint });
      return;
    }

    startTransition(async () => {
      const result = await recordCheckpointAction({
        clientId: client.id,
        checkpointId: checkpoint.id,
      });
      if (!result.success) {
        push({ title: "No se pudo registrar", description: result.error });
        return;
      }
      await refreshClients();
      push({ title: `"${checkpoint.name}" registrado`, variant: "success" });
    });
  }

  function submitRecording(input: {
    reachedAt: string;
    metrics: Record<string, unknown>;
    note: string | null;
  }) {
    if (!recording) return;
    setRecordError(null);
    startTransition(async () => {
      const result = await recordCheckpointAction({
        clientId: recording.client.id,
        checkpointId: recording.checkpoint.id,
        ...input,
      });
      if (!result.success) {
        setRecordError(result.error);
        return;
      }
      setRecording(null);
      await refreshClients();
      push({ title: "Checkpoint registrado", variant: "success" });
    });
  }

  const abrirFicha = (client: Client) => router.push(paths.platform.clients.detail(client.id));

  return (
    <div className="space-y-4">
      {/* ── Barra: acciones a la izquierda, atajos y configuración a la derecha ── */}
      {puedeGestionar ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <NewClientDialog />
            <ImportClientsDialog />
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
              C0 · Único acceso a la configuración de columnas configurables y
              del recorrido. Va acá y no en el grupo "Configuración" de la
              navegación: la barra superior saltea ese grupo entero, así que
              desde el escritorio no se llegaba. Agrupado en un menú porque
              configurar no es algo que se haga todos los días, y dos botones
              más en la barra la convertían en una hilera de siete.
            */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  Configurar
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={paths.platform.clients.checkpoints} className="gap-2">
                    <Route className="h-4 w-4" />
                    Recorrido del cliente
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={paths.platform.clients.customFields} className="gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Campos personalizados
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ) : null}

      {/* ── Buscar, filtrar, ordenar ─────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre, apodo, mail o producto"
            aria-label="Buscar clientes"
            className="h-9 pl-9"
          />
        </div>

        {/* Una sola pastilla («Todos») no es un filtro: no se dibuja. */}
        {filtros.length > 1 ? (
          <div className="max-w-full overflow-x-auto">
            <FilterPills
              options={filtros.map((f) => ({ value: f.value, label: f.label }))}
              value={filter}
              onChange={(value) => setFilter(value as ClientListFilter)}
            />
          </div>
        ) : null}

        <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          Ordenar
          <select
            className="h-9 rounded-md border border-border bg-background px-2 text-sm text-foreground"
            value={sort}
            onChange={(event) => setSort(event.target.value as ClientListSort)}
          >
            {(Object.keys(SORT_LABEL) as ClientListSort[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABEL[key]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="whitespace-nowrap px-4 py-3 font-medium">Cliente</th>
              {hasJourney ? (
                <>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Etapa</th>
                  <th className="whitespace-nowrap px-4 py-3 font-medium">Próxima tarea</th>
                </>
              ) : null}
              <th className="whitespace-nowrap px-4 py-3 font-medium">Última 1-1</th>
              {customColumns.map((field) => (
                <th key={field.id} className="whitespace-nowrap px-4 py-3 font-medium">
                  {field.label}
                </th>
              ))}
              {hasJourney ? (
                <th className="whitespace-nowrap px-4 py-3 font-medium">Progreso de etapa</th>
              ) : null}
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <StaggerFade as="tbody">
            {visibles.map((client) => {
              const status = journey[client.id];
              const destacado = STATUS_DESTACADO[client.status];
              const silencio = discordActivity[client.id];
              return (
                <StaggerFadeItem
                  as="tr"
                  key={client.id}
                  /*
                    ⭐ La fila entera abre la ficha. Antes el único camino era
                    un link de once píxeles al final de la fila; en una tabla
                    de 264 filas eso es apuntar con el mouse 264 veces. Los
                    controles de adentro (el check, la papelera) frenan la
                    propagación para no abrir la ficha de rebote.
                  */
                  className="group cursor-pointer border-b border-border/50 transition-colors hover:bg-muted/40"
                  onClick={() => abrirFicha(client)}
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Link
                        href={paths.platform.clients.detail(client.id)}
                        className="font-medium hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {client.name}
                      </Link>
                      {client.nickname ? (
                        <span className="text-xs text-muted-foreground">{client.nickname}</span>
                      ) : null}
                      {client.isSuccessCase ? (
                        <Star
                          className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                          aria-label="Caso de éxito"
                        />
                      ) : destacado ? (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {destacado.label}
                        </Badge>
                      ) : null}
                      {/* D2 · Silencio en Discord, al lado del nombre: es del cliente, no de un estado. */}
                      {silencio?.isSilent ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border border-warning/40 px-1.5 py-0.5 text-[10px] text-warning"
                          title={`Sin escribir en Discord hace ${silencio.daysSinceLastMessage} días`}
                        >
                          <MoonStar className="h-2.5 w-2.5" />
                          {silencio.daysSinceLastMessage}d
                        </span>
                      ) : null}
                    </div>
                  </td>

                  {hasJourney ? (
                    <>
                      <td className="px-4 py-3">
                        <StageCell status={status} />
                      </td>
                      <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                        <NextTaskCell
                          status={status}
                          disabled={pending}
                          canCheck={puedeGestionar}
                          onCheck={() => status && toggleNextCheckpoint(client, status)}
                        />
                      </td>
                    </>
                  ) : null}

                  <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                    <LastOneOnOneCell entry={lastOneOnOne[client.id]} />
                  </td>

                  {customColumns.map((field) => (
                    <td key={field.id} className="px-4 py-3">
                      <FieldValueCell field={field} value={client.custom?.[field.key]} />
                    </td>
                  ))}

                  {hasJourney ? (
                    <td className="px-4 py-3">
                      <StageProgressCell status={status} />
                    </td>
                  ) : null}

                  <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                    {puedeGestionar ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-7 w-7 p-0 text-muted-foreground/60 hover:text-destructive",
                          // Se ve al pasar por la fila o al llegar con el teclado;
                          // 264 papeleras siempre visibles pesan más que la tabla.
                          "opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                        )}
                        title="Eliminar cliente"
                        aria-label={`Eliminar a ${client.name}`}
                        onClick={() => setDeleteTarget(client)}
                        disabled={pending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    ) : null}
                  </td>
                </StaggerFadeItem>
              );
            })}
          </StaggerFade>
        </table>
        {visibles.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {query.trim()
              ? `Ningún cliente coincide con «${query.trim()}».`
              : "No hay clientes con este filtro."}
          </p>
        ) : null}
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

      {/* El mismo diálogo de la ficha, cuando el hito pide métricas. */}
      <RecordCheckpointDialog
        open={recording !== null}
        checkpoint={recording?.checkpoint ?? null}
        checkpointFields={checkpointFields}
        existingEvent={null}
        saving={pending}
        error={recordError}
        onClose={() => setRecording(null)}
        onSubmit={submitRecording}
      />
    </div>
  );
}

/**
 * La etapa en la que está el cliente.
 *
 * Un cliente sin ningún hito registrado muestra "Sin empezar", no "Fase 1": no
 * arrancó el recorrido, y decir lo contrario sería inventar.
 */
function StageCell({ status }: { status: ClientJourneyStatus | undefined }) {
  if (!status?.currentStageName) {
    return <span className="text-xs text-muted-foreground">Sin empezar</span>;
  }

  return (
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
  );
}

/**
 * La próxima tarea, con su check y su fecha límite.
 *
 * ⭐ La fecha sólo aparece cuando **se puede saber**: hace falta que el hito
 * tenga plazo configurado y que el anterior esté registrado. Cuando no, no se
 * pone nada en vez de una fecha inventada — y el recorrido completo dice que
 * terminó, que es una respuesta y no un vacío.
 */
function NextTaskCell({
  status,
  disabled,
  canCheck,
  onCheck,
}: {
  status: ClientJourneyStatus | undefined;
  disabled: boolean;
  /** Con solo lectura se ve la tarea y su fecha, pero no el check. */
  canCheck: boolean;
  onCheck: () => void;
}) {
  if (!status) return <span className="text-muted-foreground">—</span>;

  if (!status.nextCheckpointName) {
    return (
      <span className="text-xs text-muted-foreground">
        {status.total > 0 && status.reached === status.total
          ? "Recorrido completo"
          : "—"}
      </span>
    );
  }

  const overdue = formatOverdue(status);
  const dueAt = formatDueDate(status);

  return (
    <div className="flex items-start gap-2">
      {canCheck ? (
        <button
          type="button"
          onClick={onCheck}
          disabled={disabled}
          title={`Marcar "${status.nextCheckpointName}" como hecho`}
          aria-label={`Marcar "${status.nextCheckpointName}" como hecho`}
          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-border text-transparent transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
        >
          <Check className="h-3 w-3" />
        </button>
      ) : null}
      <div className="min-w-0 space-y-0.5">
        <span className="block text-xs">{status.nextCheckpointName}</span>
        {overdue ? (
          <span className="flex items-center gap-1 text-[11px] text-destructive">
            <AlertTriangle className="h-3 w-3" />
            {overdue}
          </span>
        ) : dueAt ? (
          <span className="block text-[11px] text-muted-foreground">
            vence el {dueAt}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Cuánto le falta para cerrar la etapa en la que está: el "3 de 4".
 *
 * ⭐ Es de la **etapa**, no del recorrido entero. Sirve para ver de un vistazo
 * quién está por lograr el próximo hito, que es otra pregunta que "cuánto le
 * falta para terminar el programa".
 *
 * Sin hitos alcanzados no hay barra: el denominador de la primera etapa haría
 * parecer que el cliente arrancó.
 */
function StageProgressCell({ status }: { status: ClientJourneyStatus | undefined }) {
  if (!status || status.stageTotal === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const pct = Math.round((status.stageReached / status.stageTotal) * 100);
  const complete = status.stageReached >= status.stageTotal;

  return (
    <div className="min-w-[88px] space-y-1">
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="text-muted-foreground">
          {status.stageReached} de {status.stageTotal}
        </span>
        {complete ? <span className="text-emerald-500">✓</span> : null}
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={status.stageReached}
        aria-valuemin={0}
        aria-valuemax={status.stageTotal}
        aria-label="Progreso de la etapa"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            complete ? "bg-emerald-500" : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * La fecha de la última sesión 1-1 con el cliente.
 *
 * ⭐ Sale de las grabaciones de Fathom que el clasificador resolvió como
 * **entrega con este cliente**. La llamada de cierre no cuenta: es con un lead y
 * su propósito es venta, así que mostrarla acá diría que hubo una sesión de
 * acompañamiento el día que se firmó el contrato.
 *
 * Cuando el vínculo se resolvió por un peldaño **candidato** —un nombre
 * normalizado, que dos personas pueden compartir— la fecha se muestra igual,
 * pero avisada. Esconderla hasta que alguien confirme dejaría la columna vacía
 * durante semanas; mostrarla sin avisar diría una fecha que puede ser de otra
 * persona.
 */
function LastOneOnOneCell({ entry }: { entry: LastOneOnOne | undefined }) {
  if (!entry) return <span className="text-xs text-muted-foreground">—</span>;

  const [year, month, day] = entry.date.split("-");
  const label = year && month && day ? `${day}/${month}/${year}` : entry.date;
  const confirmed = isConfirmedResolution(entry.resolutionMethod);

  const content = (
    <span className="inline-flex items-center gap-1.5 text-xs">
      {label}
      {/*
        ⭐ El total va pegado a la fecha y no en una columna aparte: solos, "12
        de septiembre" y "7" no dicen nada; juntos dicen si el cliente viene con
        ritmo o si hace rato que no se lo ve.
      */}
      {entry.totalCalls > 1 ? (
        <span
          className="tabular-nums text-muted-foreground"
          title={
            entry.everyDays != null
              ? `${entry.totalCalls} sesiones 1-1, una cada ${entry.everyDays} días`
              : `${entry.totalCalls} sesiones 1-1`
          }
        >
          ·&nbsp;{entry.totalCalls}
        </span>
      ) : null}
      {!confirmed ? (
        <span
          className="text-warning"
          title="Se dedujo por el nombre: puede ser de otra persona. Confirmalo en Llamadas sin asociar."
        >
          <HelpCircle className="h-3 w-3" />
        </span>
      ) : null}
    </span>
  );

  if (!entry.fathomUrl) return content;

  return (
    <a
      href={entry.fathomUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline"
      title={entry.title ?? "Abrir la grabación"}
    >
      {content}
    </a>
  );
}

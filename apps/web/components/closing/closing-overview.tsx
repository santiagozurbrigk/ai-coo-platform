"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  cn,
  GlassPanel,
} from "@ai-coo/ui";
import { Calendar, ExternalLink, Video } from "lucide-react";
import { FilterPills } from "@/components/marketing/filter-pills";
import { ModuleSubnav } from "@/components/shared/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { isSameMonth, pickCalendarFocusDate } from "@/lib/closing/calendar";
import { useHashTab } from "@/lib/hooks/use-hash-tab";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import { paths } from "@/routes";
import type { ClosingCall, ClosingCallStatus } from "@/types/closing";
import { CalendlyManualSyncNotice } from "@/components/integrations/calendly-manual-sync-notice";
import { ClosingCalendar } from "./closing-calendar";
import { PaymentModal } from "./payment-modal";
import { NoCloseModal } from "./no-close-modal";

const TABS = [
  { label: "Calendario", hash: "calendario" },
  { label: "Lista", hash: "lista" },
] as const;

const STATUS_LABEL: Record<ClosingCallStatus, string> = {
  scheduled: "Agendada",
  closed: "Completada — Cerrada",
  not_closed: "Completada — No cerrada",
  no_show: "No show",
};

const STATUS_VARIANT: Record<
  ClosingCallStatus,
  "default" | "success" | "warning" | "destructive" | "secondary"
> = {
  scheduled: "default",
  closed: "success",
  not_closed: "warning",
  no_show: "destructive",
};

function formatCallDate(iso: string) {
  return new Date(iso).toLocaleString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ClosingOverview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deepLinkCallId = searchParams.get("call");
  const { push } = useToast();
  const {
    closingCalls,
    closingCallsLoading,
    refreshClosingCalls,
    clients,
    markCallClosed,
    markCallNotClosed,
    markCallNoShow,
  } = usePlatformData();
  const activeTab = useHashTab("calendario");
  const root = paths.platform.sales.closing;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [listFilter, setListFilter] = useState<ClosingCallStatus | "all">("all");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [noCloseOpen, setNoCloseOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<"month" | "week">("month");
  const [calendarAnchor, setCalendarAnchor] = useState(() =>
    pickCalendarFocusDate(closingCalls)
  );

  useEffect(() => {
    void refreshClosingCalls();
  }, [refreshClosingCalls]);

  useEffect(() => {
    if (closingCalls.length === 0) return;
    setCalendarAnchor((prev) => {
      const hasCallInView = closingCalls.some((c) =>
        isSameMonth(new Date(c.scheduledAt), prev)
      );
      return hasCallInView ? prev : pickCalendarFocusDate(closingCalls);
    });
  }, [closingCalls]);

  const appliedDeepLinkRef = useRef<string | null>(null);

  useEffect(() => {
    if (closingCalls.length === 0) {
      setSelectedId(null);
      return;
    }
    if (
      deepLinkCallId &&
      appliedDeepLinkRef.current !== deepLinkCallId &&
      closingCalls.some((c) => c.id === deepLinkCallId)
    ) {
      appliedDeepLinkRef.current = deepLinkCallId;
      setSelectedId(deepLinkCallId);
      return;
    }
    if (!selectedId || !closingCalls.some((c) => c.id === selectedId)) {
      setSelectedId(closingCalls[0].id);
    }
  }, [closingCalls, selectedId, deepLinkCallId]);

  const selected = closingCalls.find((c) => c.id === selectedId);

  const filteredCalls = useMemo(() => {
    if (listFilter === "all") return closingCalls;
    return closingCalls.filter((c) => c.status === listFilter);
  }, [closingCalls, listFilter]);

  const navTabs = TABS.map((t) => ({
    label: t.label,
    href: `${root}#${t.hash}`,
  }));

  return (
    <div className="space-y-6">
      <PageHeader description="Calendario de llamadas de cierre, contexto Calendly y resultados" />

      <CalendlyManualSyncNotice showIntegrationsLink />

      <ModuleSubnav
        tabs={navTabs}
        isTabActive={(href) => (href.split("#")[1] ?? "calendario") === activeTab}
      />

      <div className="flex flex-col gap-6">
        <div className="min-w-0 w-full space-y-4">
          {closingCallsLoading ? (
            <p className="text-sm text-muted-foreground">Cargando llamadas…</p>
          ) : closingCalls.length === 0 ? (
            <EmptyState
              title="Sin llamadas agendadas"
              description="Conectá Calendly para ver tus llamadas de cierre aquí."
              icon={<Calendar className="h-8 w-8" />}
              action={
                <Button variant="outline" size="sm" asChild>
                  <Link href={paths.platform.integrations}>Conectar Calendly</Link>
                </Button>
              }
            />
          ) : activeTab === "lista" ? (
            <>
              <FilterPills
                options={(
                  ["all", "scheduled", "closed", "not_closed", "no_show"] as const
                ).map((f) => ({
                  value: f,
                  label:
                    f === "all" ? "Todos" : STATUS_LABEL[f as ClosingCallStatus],
                }))}
                value={listFilter}
                onChange={(value) =>
                  setListFilter(value as typeof listFilter)
                }
              />
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                      <th className="px-4 py-3">Lead</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3">Closer</th>
                      <th className="px-4 py-3">Resultado</th>
                      <th className="px-4 py-3">Ingreso</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalls.map((call) => (
                      <tr
                        key={call.id}
                        className={cn(
                          "border-b border-border/50 cursor-pointer hover:bg-muted/30",
                          selectedId === call.id && "bg-muted/40"
                        )}
                        onClick={() => setSelectedId(call.id)}
                      >
                        <td className="px-4 py-3 font-medium">{call.leadName}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatCallDate(call.scheduledAt)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[call.status]}>
                            {STATUS_LABEL[call.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {call.closedByName ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {call.outcome?.paymentType ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {call.outcome?.revenue
                            ? `$${call.outcome.revenue.toLocaleString()}`
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Button size="sm" variant="ghost">
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={calendarMode === "month" ? "default" : "outline"}
                    onClick={() => setCalendarMode("month")}
                  >
                    Mes
                  </Button>
                  <Button
                    size="sm"
                    variant={calendarMode === "week" ? "default" : "outline"}
                    onClick={() => setCalendarMode("week")}
                  >
                    Semana
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Llamadas importadas desde Calendly
                </p>
              </div>
              <ClosingCalendar
                calls={closingCalls}
                mode={calendarMode}
                anchorDate={calendarAnchor}
                onAnchorChange={setCalendarAnchor}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {(
                  [
                    ["scheduled", "Agendada"],
                    ["closed", "Cerrada"],
                    ["not_closed", "No cerrada"],
                    ["no_show", "No show"],
                  ] as const
                ).map(([status, label]) => (
                  <span key={status} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        status === "scheduled" && "bg-primary",
                        status === "closed" && "bg-emerald-500",
                        status === "not_closed" && "bg-amber-500",
                        status === "no_show" && "bg-destructive"
                      )}
                    />
                    {label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {selected && (
          <CallDetailPanel
            call={selected}
            linkedClient={clients.find((c) => c.closingCallId === selected.id)}
            onMarkClosed={() => setPaymentOpen(true)}
            onMarkNotClosed={() => setNoCloseOpen(true)}
            onMarkNoShow={async () => {
              try {
                await markCallNoShow(selected.id);
                push({ title: "Marcado como no show", variant: "success" });
              } catch (e) {
                push({
                  title: "Error al guardar",
                  description: e instanceof Error ? e.message : undefined,
                  variant: "default",
                });
              }
            }}
          />
        )}
      </div>

      {selected && (
        <>
          <PaymentModal
            open={paymentOpen}
            onOpenChange={setPaymentOpen}
            defaultName={selected.leadName}
            onSubmit={async (payload) => {
              try {
                const client = await markCallClosed(selected.id, payload);
                push({
                  title: "Cliente creado",
                  description: `${client.name} añadido con estado Realizar onboarding`,
                  variant: "success",
                });
                router.push(paths.platform.clients.detail(client.id));
              } catch (e) {
                push({
                  title: "Error al guardar cliente",
                  description:
                    e instanceof Error ? e.message : "Intenta de nuevo",
                  variant: "default",
                });
              }
            }}
          />
          <NoCloseModal
            open={noCloseOpen}
            onOpenChange={setNoCloseOpen}
            onSubmit={async (reason, notes) => {
              try {
                await markCallNotClosed(selected.id, reason, notes);
                push({ title: "Resultado guardado", variant: "success" });
              } catch (e) {
                push({
                  title: "Error al guardar",
                  description: e instanceof Error ? e.message : undefined,
                  variant: "default",
                });
              }
            }}
          />
        </>
      )}
    </div>
  );
}

function CallDetailPanel({
  call,
  linkedClient,
  onMarkClosed,
  onMarkNotClosed,
  onMarkNoShow,
}: {
  call: ClosingCall;
  linkedClient?: { id: string; name: string };
  onMarkClosed: () => void;
  onMarkNotClosed: () => void;
  onMarkNoShow: () => void;
}) {
  const isScheduled = call.status === "scheduled";

  return (
    <GlassPanel className="w-full p-5 space-y-5">
      <div>
        <p className="text-lg font-semibold">{call.leadName}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {formatCallDate(call.scheduledAt)}
        </p>
        <Badge className="mt-2" variant={STATUS_VARIANT[call.status]}>
          {STATUS_LABEL[call.status]}
        </Badge>
      </div>

      <section>
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Respuestas del formulario Calendly
        </h4>
        <dl className="space-y-3">
          {call.formAnswers.map((a, i) => (
            <div key={i}>
              <dt className="text-xs text-muted-foreground">{a.question}</dt>
              <dd className="text-sm mt-0.5">{a.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {call.fathomUrl && (
        <section className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Video className="h-4 w-4" />
            Grabación Fathom
          </div>
          <div className="aspect-video rounded-md bg-muted/50 flex items-center justify-center text-xs text-muted-foreground">
            Vista previa
          </div>
          <Button size="sm" variant="outline" className="w-full gap-2" asChild>
            <a href={call.fathomUrl} target="_blank" rel="noopener noreferrer">
              Abrir en Fathom
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </section>
      )}

      {isScheduled ? (
        <section className="space-y-2 pt-2 border-t border-border">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Resultado de la llamada
          </h4>
          <Button className="w-full" onClick={onMarkClosed}>
            Marcar como cerrada
          </Button>
          <Button className="w-full" variant="outline" onClick={onMarkNotClosed}>
            Marcar como no cerrada
          </Button>
          <Button className="w-full" variant="ghost" onClick={onMarkNoShow}>
            Marcar como no show
          </Button>
        </section>
      ) : (
        <section className="space-y-3 pt-2 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Resultado registrado — no podés modificarlo desde acá.
          </p>
          {call.status === "closed" && linkedClient ? (
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link href={paths.platform.clients.detail(linkedClient.id)}>
                Ver cliente — {linkedClient.name}
              </Link>
            </Button>
          ) : null}
        </section>
      )}
    </GlassPanel>
  );
}

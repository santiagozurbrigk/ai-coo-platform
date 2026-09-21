"use client";

/**
 * El encabezado de la ficha: quién es, en qué estado está, y las dos acciones
 * que no son de ninguna sección.
 *
 * ⭐ Absorbe tres bloques que antes eran paneles sueltos: el apodo (que ocupaba
 * un panel entero arriba de todo para un campo opcional), el «flujo de estado»
 * (otro panel entero) y el botón «Marcar como caso de éxito» perdido al fondo de
 * la página — que era, literalmente, el último paso de ese mismo flujo, así que
 * existía dos veces.
 *
 * El estado se muestra como un recorrido de cuatro pasos porque **es** un
 * recorrido: nadie vuelve de «Activo» a «Realizar onboarding». Dibujarlo como
 * pasos dice de un vistazo cuánto falta; un menú desplegable no.
 */

import Link from "next/link";
import { Badge, Button, cn } from "@ai-coo/ui";
import { ArrowLeft, Check, ChevronRight, Receipt, Star } from "lucide-react";
import { paths } from "@/routes";
import type { Client, ClientStatus } from "@/types/clients";

export const STATUS_FLOW: ClientStatus[] = [
  "pending_onboarding",
  "onboarding_done",
  "active",
  "success_case",
];

export const STATUS_LABEL: Record<ClientStatus, string> = {
  pending_onboarding: "Realizar onboarding",
  onboarding_done: "Onboarding realizado",
  active: "Activo",
  success_case: "Caso de éxito",
};

function formatearAlta(iso: string): string {
  const fecha = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function PasosDeEstado({
  current,
  onChange,
}: {
  current: ClientStatus;
  onChange: (status: ClientStatus) => void;
}) {
  const currentIndex = STATUS_FLOW.indexOf(current);

  return (
    <ol className="flex flex-wrap items-center gap-1" aria-label="Estado del cliente">
      {STATUS_FLOW.map((status, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={status} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onChange(status)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors",
                active && "border-primary bg-primary/10 text-primary",
                done && "border-border bg-muted/40 text-foreground/70 hover:text-foreground",
                !active && !done && "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {done ? <Check className="h-3 w-3" aria-hidden /> : null}
              {status === "success_case" ? (
                <Star className={cn("h-3 w-3", active && "fill-current")} aria-hidden />
              ) : null}
              {STATUS_LABEL[status]}
            </button>
            {index < STATUS_FLOW.length - 1 ? (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function ClientHeader({
  client,
  puedeVerCobros,
  onStatusChange,
}: {
  client: Client;
  puedeVerCobros: boolean;
  onStatusChange: (status: ClientStatus) => void;
}) {
  return (
    <header className="space-y-4">
      <Button variant="ghost" size="sm" className="-ml-2 gap-2" asChild>
        <Link href={paths.platform.clients.root}>
          <ArrowLeft className="h-4 w-4" />
          Clientes
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
            {client.isSuccessCase ? (
              <Badge variant="ai" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                Caso de éxito
              </Badge>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-muted-foreground">
            <span>Cliente desde el {formatearAlta(client.joinDate)}</span>
            {client.offeredProduct ? (
              <>
                <span aria-hidden>·</span>
                <span>{client.offeredProduct}</span>
              </>
            ) : null}
          </div>
        </div>

        {puedeVerCobros ? (
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link href={paths.platform.sales.cobrosDeCliente(client.id)}>
              <Receipt className="h-4 w-4" />
              Ver cobros
            </Link>
          </Button>
        ) : null}
      </div>

      <PasosDeEstado current={client.status} onChange={onStatusChange} />
    </header>
  );
}

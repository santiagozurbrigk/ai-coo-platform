"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarClock, Mail, Tag, Users } from "lucide-react";
import { Badge, Button, cn } from "@ai-coo/ui";
import {
  setMeetingTypePurposeAction,
  type MeetingTypeRow,
  type MeetingTypesState,
} from "@/app/fathom/classification-actions";
import type { CallPurpose } from "@/lib/fathom/parse-title";
import { useToast } from "@/providers/toast-provider";

/**
 * Configuración de la clasificación de llamadas de Fathom.
 *
 * ⭐ **Los tipos de reunión se crean en Fathom, no acá.** Su API es de sólo
 * lectura: OTC los lista y les asigna un significado, nada más. Si la lista
 * viene vacía, la organización no tiene tipos configurados —un caso normal— y el
 * panel lo dice en vez de mostrar una tabla vacía sin explicación.
 *
 * ⭐ **Esto es opcional.** Las llamadas de venta se identifican por el cruce
 * entre la grabación y el turno agendado, que funciona sin que nadie configure
 * nada. El mapeo sirve para lo que no es un turno: entregas y reuniones de
 * equipo.
 */

const PURPOSE_LABEL: Record<CallPurpose, string> = {
  sales: "Venta",
  delivery: "Entrega",
  team: "Equipo",
};

const PURPOSES: CallPurpose[] = ["sales", "delivery", "team"];

const selectClass =
  "h-9 rounded-md border border-border bg-background px-2 text-sm";

function MeetingTypeRowItem({ row }: { row: MeetingTypeRow }) {
  const router = useRouter();
  const { push } = useToast();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<string>(row.purpose ?? "");

  function handleChange(next: string) {
    setValue(next);
    startTransition(async () => {
      const result = await setMeetingTypePurposeAction({
        meetingTypeName: row.name,
        purpose: next ? (next as CallPurpose) : null,
      });
      if (!result.ok) {
        push({ title: "No se pudo guardar", description: result.error });
        setValue(row.purpose ?? "");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{row.name}</span>
          {row.status === "inactive" && !row.orphaned && (
            <Badge variant="secondary" className="text-[10px]">
              Inactivo
            </Badge>
          )}
          {row.orphaned && (
            <Badge variant="warning" className="text-[10px]">
              Ya no existe en Fathom
            </Badge>
          )}
        </div>
        {row.orphaned && (
          <p className="text-xs text-muted-foreground">
            Se mapeó cuando el tipo existía. Fathom identifica los tipos por su
            nombre, así que renombrarlo deja el mapeo huérfano — dejalo sin
            asignar y mapeá el nombre nuevo.
          </p>
        )}
      </div>

      <select
        className={selectClass}
        value={value}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        aria-label={`Propósito de ${row.name}`}
      >
        <option value="">Sin asignar</option>
        {PURPOSES.map((purpose) => (
          <option key={purpose} value={purpose}>
            {PURPOSE_LABEL[purpose]}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FathomCallClassificationPanel({
  state,
}: {
  state: MeetingTypesState;
}) {
  if (state.status === "not_connected") return null;

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-1 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Tipos de reunión</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Decidí una vez qué significa cada tipo de reunión de Fathom y OTC
          clasifica las llamadas solo. Los tipos se crean dentro de Fathom.
        </p>
      </div>

      {state.status === "unavailable" ? (
        <div className="flex items-start gap-2 px-4 py-4 text-sm text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>
            No se pudo consultar los tipos de reunión. Es distinto de no tener
            ninguno: no llegamos a preguntar. Revisá la conexión con Fathom.
          </p>
        </div>
      ) : state.types.length === 0 ? (
        <div className="flex flex-col gap-3 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Tu cuenta de Fathom no tiene tipos de reunión configurados.
          </p>
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <p className="mb-2 text-xs font-medium">
              No hace falta que hagas nada: las llamadas de venta se identifican
              igual.
            </p>
            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Cruzando la grabación con el turno agendado, por horario.
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Por el mail de los invitados, que Fathom devuelve siempre.
              </li>
              <li className="flex items-start gap-2">
                <Users className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Una reunión sin invitados externos es del equipo.
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {state.types.map((row) => (
            <MeetingTypeRowItem key={row.name} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Etiqueta legible de un propósito, para reutilizar en otras pantallas. */
export function purposeLabel(purpose: CallPurpose | null): string {
  return purpose ? PURPOSE_LABEL[purpose] : "Sin clasificar";
}

export { PURPOSE_LABEL };

/** Marca visual del propósito, con el mismo criterio en toda la app. */
export function PurposeBadge({ purpose }: { purpose: CallPurpose | null }) {
  return (
    <Badge
      variant={purpose ? "secondary" : "outline"}
      className={cn("text-[10px]", !purpose && "text-muted-foreground")}
    >
      {purposeLabel(purpose)}
    </Badge>
  );
}

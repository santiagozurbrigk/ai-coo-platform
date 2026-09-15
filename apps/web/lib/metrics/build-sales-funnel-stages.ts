import { callIsSale, callWasAttended } from "@/lib/closing/call-status";
import type { ClosingCall } from "@/types/closing";
import type { Conversation } from "@/types/sales";

/**
 * Etapas del embudo del panel general: del primer DM al cierre.
 *
 * ⭐ **Tres reglas, y las tres nacieron de un embudo roto en producción.**
 *
 * 1. **Las etapas de abajo salen todas de `closing_calls`.** Antes la última
 *    etapa era "Clientes activos" (`clients` con `status = 'active'`), y eso
 *    no es una etapa: es el **stock** del CRM, con clientes importados que
 *    nunca pasaron por este embudo. Contra 1 cierre registrado daba 263, o sea
 *    un embudo que crece. Agendadas ⊇ realizadas ⊇ cierres sale de la misma
 *    tabla y es decreciente **por construcción**.
 * 2. **No se filtran las etapas en cero del medio.** Sacarlas cambia el
 *    denominador y el orden: un cero en el medio es información —ahí se corta
 *    el embudo—, no ruido.
 * 3. **Sí se descartan las etapas vacías de arriba.** Si la fuente del tope no
 *    tiene datos, el embudo arranca en la primera etapa que sí los tiene. Es
 *    exactamente lo que pasa hoy con los DMs: la tabla `conversations` es la
 *    del inbox viejo (ManyChat/Unipile) y quedó vacía cuando el inbox pasó a
 *    Zernio, así que el embudo arranca en las llamadas.
 *
 * Entre "Respondidos" y "Llamadas agendadas" la comparación puede no cerrar
 * —una llamada de Calendly puede no venir de un DM—, y por eso el chart acota
 * la escala (`lib/chart/funnel-scale.ts`) en vez de confiar en los datos.
 */

export type SalesFunnelStage = {
  id: string;
  label: string;
  value: number;
};

export type SalesFunnel = {
  stages: SalesFunnelStage[];
  /** Bajada de la card, según dónde arranque el embudo. */
  subtitle: string;
  /** Conversión de punta a punta, o `null` si no se puede calcular. */
  conversion: string | null;
};

const SUBTITLE_BY_FIRST_STAGE: Record<string, string> = {
  leads: "De los DMs al cierre",
  responded: "De la respuesta al cierre",
  scheduled: "De la llamada agendada al cierre",
  attended: "De la llamada realizada al cierre",
  closed: "Cierres registrados",
};

/**
 * Una conversión que existe pero redondea a cero se muestra como `<1%`: un
 * "0%" al lado de un cierre real se lee como si no hubiera cerrado ninguno.
 */
function formatConversion(ratio: number): string {
  const pct = ratio * 100;
  if (pct > 0 && pct < 1) return "<1%";
  return `${Math.round(pct)}%`;
}

function isResponded(conversation: Conversation): boolean {
  return (
    conversation.status === "active" ||
    conversation.status === "booked" ||
    conversation.status === "closed"
  );
}

export function buildSalesFunnel(
  conversations: Conversation[],
  closingCalls: ClosingCall[]
): SalesFunnel {
  const allStages: SalesFunnelStage[] = [
    { id: "leads", label: "Leads DMs", value: conversations.length },
    {
      id: "responded",
      label: "Respondidos",
      value: conversations.filter(isResponded).length,
    },
    {
      id: "scheduled",
      label: "Llamadas agendadas",
      // Una llamada cancelada nunca ocurrió: contarla infla el tope del tramo
      // de llamadas con turnos que nadie dejó plantado.
      value: closingCalls.filter((c) => c.status !== "cancelled").length,
    },
    {
      id: "attended",
      label: "Llamadas realizadas",
      value: closingCalls.filter((c) => callWasAttended(c.status)).length,
    },
    {
      id: "closed",
      label: "Cierres",
      value: closingCalls.filter((c) => callIsSale(c.status)).length,
    },
  ];

  const firstWithData = allStages.findIndex((stage) => stage.value > 0);
  const stages = firstWithData === -1 ? [] : allStages.slice(firstWithData);

  const first = stages[0];
  const last = stages.at(-1);
  const conversion =
    first && last && first.value > 0 && stages.length > 1
      ? formatConversion(last.value / first.value)
      : null;

  return {
    stages,
    subtitle: first ? (SUBTITLE_BY_FIRST_STAGE[first.id] ?? "") : "",
    conversion,
  };
}

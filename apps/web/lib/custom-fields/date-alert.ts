/**
 * ⭐ El aviso por proximidad de un campo de fecha.
 *
 * Viene de un pedido concreto: "quiero anotar cuándo es el próximo lanzamiento
 * de cada cliente, y que se ponga en rojo cuando falten menos de 15 días".
 *
 * La tentación era una columna `proximo_lanzamiento` en `clients`. Se descartó
 * porque eso le sirve a **una sola organización** —la que vende consultoría de
 * lanzamientos—; para quien vende otra cosa sería una columna muerta en la ficha
 * de todos sus clientes. Un producto multi-organización no puede hornear el
 * vocabulario de un cliente en el esquema.
 *
 * Los campos configurables ya permitían una fecha por cliente. Esto agrega
 * sólo lo que faltaba: el umbral. Quien vende lanzamientos define "Próximo
 * lanzamiento · avisar a 15 días"; quien vende otra cosa, "Vence el contrato ·
 * avisar a 30". Mismo mecanismo, cada uno su vocabulario.
 *
 * Lógica pura: no toca base ni red.
 */

export type EstadoDeFecha = "lejos" | "cerca" | "hoy" | "pasada";

export type AvisoDeFecha = {
  estado: EstadoDeFecha;
  /** Negativo si ya pasó. */
  diasFaltantes: number;
  /** `true` sólo cuando hay que llamar la atención: cerca, hoy o pasada. */
  alerta: boolean;
};

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Convierte una fecha a medianoche local, para contar días de calendario.
 *
 * Sin esto, "faltan 15 días" cambiaría según la hora a la que mirás la
 * pantalla: a las 23:00 de un día faltarían 14 días y algo, y el aviso se
 * prendería antes o después según el momento. Los días de calendario son lo que
 * la persona cuenta.
 */
function aMedianoche(fecha: Date): number {
  return new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate()
  ).getTime();
}

/** Parsea `2026-09-30` sin que el huso horario la corra un día. */
function parsearFechaDeCampo(valor: string): Date | null {
  const soloFecha = /^(\d{4})-(\d{2})-(\d{2})/.exec(valor.trim());
  if (soloFecha) {
    const [, anio, mes, dia] = soloFecha;
    return new Date(Number(anio), Number(mes) - 1, Number(dia));
  }
  const parseada = new Date(valor);
  return Number.isNaN(parseada.getTime()) ? null : parseada;
}

/**
 * Calcula el aviso de una fecha contra su umbral.
 *
 * Devuelve `null` cuando no hay nada que avisar: sin umbral configurado, sin
 * valor, o con un valor que no es una fecha. **Un valor ilegible no se pinta de
 * rojo**: teñir de alerta algo que no se entendió es inventar una urgencia.
 */
export function resolverAvisoDeFecha(
  valor: unknown,
  diasDeAviso: number | null | undefined,
  ahora: Date = new Date()
): AvisoDeFecha | null {
  if (!diasDeAviso || diasDeAviso <= 0) return null;
  if (typeof valor !== "string" || !valor.trim()) return null;

  const fecha = parsearFechaDeCampo(valor);
  if (!fecha) return null;

  const diasFaltantes = Math.round(
    (aMedianoche(fecha) - aMedianoche(ahora)) / MS_POR_DIA
  );

  if (diasFaltantes < 0) {
    return { estado: "pasada", diasFaltantes, alerta: true };
  }
  if (diasFaltantes === 0) {
    return { estado: "hoy", diasFaltantes, alerta: true };
  }
  if (diasFaltantes <= diasDeAviso) {
    return { estado: "cerca", diasFaltantes, alerta: true };
  }
  return { estado: "lejos", diasFaltantes, alerta: false };
}

/** El texto corto que acompaña la fecha. */
export function textoDelAviso(aviso: AvisoDeFecha): string {
  switch (aviso.estado) {
    case "pasada": {
      const dias = Math.abs(aviso.diasFaltantes);
      return dias === 1 ? "fue ayer" : `hace ${dias} días`;
    }
    case "hoy":
      return "es hoy";
    case "cerca":
      return aviso.diasFaltantes === 1
        ? "falta 1 día"
        : `faltan ${aviso.diasFaltantes} días`;
    case "lejos":
      return "";
  }
}

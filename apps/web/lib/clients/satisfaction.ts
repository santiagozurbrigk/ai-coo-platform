/**
 * ⭐ El nivel de satisfacción de un cliente, y cuándo dejar de creerle.
 *
 * Es una impresión de una persona, no una medición. Por eso el dato viene
 * siempre con **cuándo** y **quién**: una marca de "muy conforme" de hace cuatro
 * meses no dice nada sobre hoy, y mostrada sin fecha se lee como si fuera
 * actual. Un dato viejo presentado como fresco es peor que no tener dato,
 * porque decide cosas.
 *
 * Más adelante esto puede salir solo de lo que el bot de Discord lee en las
 * conversaciones. Por eso `origen` existe desde ahora: cuando llegue lo
 * automático, va a haber que distinguir "lo dijo alguien" de "lo dedujo el
 * sistema", y agregarlo después obligaría a mirar cada fila vieja y adivinar.
 *
 * Lógica pura: no toca base ni red.
 */

export const NIVELES_DE_SATISFACCION = [
  "en_riesgo",
  "disconforme",
  "neutral",
  "conforme",
  "muy_conforme",
] as const;

export type NivelDeSatisfaccion = (typeof NIVELES_DE_SATISFACCION)[number];

export type OrigenDeSatisfaccion = "manual" | "discord";

export const ETIQUETAS_DE_SATISFACCION: Record<
  NivelDeSatisfaccion,
  { label: string; descripcion: string; color: string }
> = {
  en_riesgo: {
    label: "En riesgo",
    descripcion: "Se puede ir. Hay que hacer algo esta semana.",
    color: "text-destructive",
  },
  disconforme: {
    label: "Disconforme",
    descripcion: "Dijo algo o se nota que algo no le cierra.",
    color: "text-warning",
  },
  neutral: {
    label: "Neutral",
    descripcion: "Ni contento ni molesto. Cumple y ya.",
    color: "text-muted-foreground",
  },
  conforme: {
    label: "Conforme",
    descripcion: "Está bien, sin quejas.",
    color: "text-foreground",
  },
  muy_conforme: {
    label: "Muy conforme",
    descripcion: "Candidato a testimonio o referido.",
    color: "text-success",
  },
};

export function esNivelValido(valor: unknown): valor is NivelDeSatisfaccion {
  return (
    typeof valor === "string" &&
    (NIVELES_DE_SATISFACCION as readonly string[]).includes(valor)
  );
}

/**
 * ⭐ A partir de cuántos días una marca deja de ser información.
 *
 * Dos meses es el criterio: en un acompañamiento mensual, una impresión de hace
 * más de dos ciclos ya no describe la relación. No se borra el dato —el
 * histórico sirve—, se marca como vencido para que quien lo lee sepa que hay
 * que volver a preguntar.
 */
export const DIAS_PARA_QUE_VENZA = 60;

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export type EstadoDeSatisfaccion =
  | { cargada: false }
  | {
      cargada: true;
      nivel: NivelDeSatisfaccion;
      diasDesdeLaMarca: number;
      vencida: boolean;
    };

export function resolverSatisfaccion(
  nivel: string | null | undefined,
  marcadaEl: string | null | undefined,
  ahora: Date = new Date()
): EstadoDeSatisfaccion {
  if (!esNivelValido(nivel)) return { cargada: false };

  // Sin fecha no se puede saber si envejeció. Se muestra el nivel, pero se
  // trata como vencido: es más honesto que dar por fresco algo que no se sabe.
  if (!marcadaEl) {
    return { cargada: true, nivel, diasDesdeLaMarca: Infinity, vencida: true };
  }

  const cuando = new Date(marcadaEl).getTime();
  if (Number.isNaN(cuando)) {
    return { cargada: true, nivel, diasDesdeLaMarca: Infinity, vencida: true };
  }

  // Una fecha futura no vence: es un reloj mal puesto, no un dato viejo.
  const dias = Math.max(0, Math.floor((ahora.getTime() - cuando) / MS_POR_DIA));

  return {
    cargada: true,
    nivel,
    diasDesdeLaMarca: dias,
    vencida: dias > DIAS_PARA_QUE_VENZA,
  };
}

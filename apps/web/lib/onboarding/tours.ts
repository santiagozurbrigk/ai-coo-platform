/**
 * Tours contextuales, definidos como datos.
 *
 * Agregar un tour es agregar una entrada acá y los `data-tour` en el JSX. Si
 * hiciera falta escribir un componente, algo salió mal.
 *
 * **Las anclas van como `data-tour`, nunca como clases de Tailwind.** Una clase
 * cambia con el primer refactor de estilos y el tour se rompe **en silencio**:
 * el paso simplemente no aparece. `data-tour` existe sólo para esto, así que
 * nadie lo toca sin querer, y el test de `__tests__/tours.test.ts` verifica que
 * cada ancla siga existiendo en el código.
 */

import type { PermissionModuleId } from "@/constants/permission-modules";
import { paths } from "@/routes/paths";

export const TOUR_IDS = [
  "funnels",
  "marketing_content",
  "agent",
  "sales_inbox",
] as const;

export type TourId = (typeof TOUR_IDS)[number];

export type TourStep = {
  /** Valor del atributo `data-tour` del elemento a señalar. */
  anchor: string;
  title: string;
  description: string;
};

export type Tour = {
  id: TourId;
  /** Se dispara en esta ruta y en las que cuelgan de ella. */
  path: string;
  /** Sin este permiso el tour no se ofrece. */
  permissionId: PermissionModuleId;
  steps: TourStep[];
};

export const TOURS: readonly Tour[] = [
  {
    id: "funnels",
    path: paths.platform.funnels.root,
    permissionId: "funnels",
    steps: [
      {
        anchor: "funnels-create",
        title: "Elegí el tipo de embudo",
        description:
          "El tipo define qué pasos tiene. Las siete etapas de fondo son siempre las mismas, así que dos embudos distintos se pueden comparar entre sí.",
      },
      {
        anchor: "funnels-list",
        title: "Cuántos pasos ya tienen fuente",
        description:
          "Un embudo mide de verdad cuando todos sus pasos están vinculados a un origen de datos. Hasta entonces vas a ver huecos en vez de números inventados.",
      },
    ],
  },
  {
    id: "marketing_content",
    path: paths.platform.marketing.content,
    permissionId: "marketing",
    steps: [
      {
        anchor: "content-tabs",
        title: "Publicado y borradores",
        description:
          "En Biblioteca está lo que ya salió, con sus métricas. En Borradores, lo que generó la IA y todavía no publicaste.",
      },
      {
        anchor: "content-grid",
        title: "Cada pieza guarda su análisis",
        description:
          "Entrá a una para ver métricas, comentarios y los anuncios que la usan. El análisis con IA te dice qué tienen en común las que funcionan.",
      },
    ],
  },
  {
    id: "agent",
    path: paths.platform.agent.root,
    permissionId: "agent",
    steps: [
      {
        anchor: "agent-sidebar",
        title: "Tus conversaciones",
        description:
          "Cada una mantiene su propio hilo. El agente recuerda lo que hablaron sin que tengas que repetirle el contexto.",
      },
      {
        anchor: "agent-module",
        title: "Preguntale sobre tu negocio",
        description:
          "Lee tus datos reales: clientes, ventas, contenido y los documentos que hayas cargado. Cuanto más completa la configuración, menos genéricas las respuestas.",
      },
    ],
  },
  {
    id: "sales_inbox",
    path: paths.platform.sales.inbox,
    permissionId: "sales",
    steps: [
      {
        anchor: "inbox-conversations",
        title: "Todos tus DMs en un lugar",
        description:
          "Instagram y WhatsApp llegan acá vía Zernio. Podés responder sin salir del sistema.",
      },
      {
        anchor: "inbox-thread",
        title: "La conversación completa",
        description:
          "Con el historial y lo que la IA detectó sobre el lead.",
      },
    ],
  },
] as const;

const TOUR_BY_ID = new Map(TOURS.map((t) => [t.id, t]));

export function getTour(id: TourId): Tour | undefined {
  return TOUR_BY_ID.get(id);
}

/**
 * El tour que corresponde a una ruta.
 *
 * Se elige la coincidencia **más específica** para que una ruta anidada no
 * dispare el tour de su padre por accidente.
 */
export function tourForPath(pathname: string): Tour | undefined {
  let best: Tour | undefined;

  for (const tour of TOURS) {
    const matches =
      pathname === tour.path || pathname.startsWith(`${tour.path}/`);
    if (!matches) continue;
    if (!best || tour.path.length > best.path.length) best = tour;
  }

  return best;
}

/** Todas las anclas declaradas, para el test que verifica que existan. */
export const ALL_TOUR_ANCHORS: string[] = TOURS.flatMap((t) =>
  t.steps.map((s) => s.anchor)
);

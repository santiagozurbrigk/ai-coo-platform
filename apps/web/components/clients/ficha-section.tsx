import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { GlassPanel, cn } from "@ai-coo/ui";

/**
 * Los dos contenedores de la ficha del cliente.
 *
 * ⭐ Existen porque la ficha tenía **catorce bloques con seis estilos de
 * encabezado distintos**: `h2` pelado, `h2` con ícono, `h3` adentro de un panel,
 * `label` en gris, un panel sin título, y un botón suelto sin bloque. Cada
 * sección se había escrito en una sesión distinta y cada una resolvió el
 * encabezado a su manera. El resultado no se leía como una pantalla sino como
 * una pila.
 *
 * Hay dos y no uno porque la ficha tiene dos columnas con dos ritmos:
 *
 * - `FichaSection` — para la columna principal, donde vive el trabajo (las
 *   sesiones, las tareas, el recorrido). Título afuera, contenido abajo, aire.
 * - `FichaCard` — para la columna lateral, donde vive el contexto (los datos,
 *   las notas, la satisfacción). Título adentro del panel, compacto.
 *
 * Los dos comparten la misma fila de encabezado: ícono gris, título, un dato
 * chico a la derecha del título (`meta`) y una acción al borde (`action`).
 */

/**
 * Una acción secundaria de fila, quieta.
 *
 * ⭐ En este design system `ghost` **no** es un botón sin borde: es un botón con
 * borde naranja. Una fila con dos —editar y deshacer, mandar y borrar— pone dos
 * anillos encendidos por renglón, y quince renglones después el acento de marca
 * dejó de marcar nada. Lo que pide acción se queda con el naranja; corregir o
 * borrar algo que ya está, se queda en gris hasta que le pasás por encima.
 */
export const ACCION_DE_FILA =
  "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground dark:border-transparent dark:text-muted-foreground";

type HeaderProps = {
  icon?: LucideIcon;
  title: string;
  /** Un dato corto al lado del título: «3 de 8», «hace 5 días», un contador. */
  meta?: ReactNode;
  /** Un botón o link, pegado al borde derecho. */
  action?: ReactNode;
};

function Header({
  icon: Icon,
  title,
  meta,
  action,
  as: Tag,
  className,
}: HeaderProps & { as: "h2" | "h3"; className?: string }) {
  return (
    <div className={cn("flex min-h-8 flex-wrap items-center justify-between gap-2", className)}>
      <Tag className="flex min-w-0 items-center gap-2 text-sm font-medium">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
        <span className="truncate">{title}</span>
        {meta ? (
          <span className="shrink-0 text-xs font-normal text-muted-foreground">{meta}</span>
        ) : null}
      </Tag>
      {action ? <div className="flex shrink-0 items-center gap-1">{action}</div> : null}
    </div>
  );
}

export function FichaSection({
  children,
  className,
  ...header
}: HeaderProps & { children: ReactNode; className?: string }) {
  return (
    <section className={cn("space-y-3", className)}>
      <Header {...header} as="h2" />
      {children}
    </section>
  );
}

export function FichaCard({
  children,
  className,
  flush = false,
  ...header
}: HeaderProps & {
  children: ReactNode;
  className?: string;
  /** El contenido llega hasta el borde: listas con divisores, tablas. */
  flush?: boolean;
}) {
  return (
    <GlassPanel className={cn("overflow-hidden p-0", className)}>
      <Header {...header} as="h3" className={cn("px-4 pt-4", flush ? "pb-3" : "pb-2")} />
      <div className={flush ? undefined : "px-4 pb-4"}>{children}</div>
    </GlassPanel>
  );
}

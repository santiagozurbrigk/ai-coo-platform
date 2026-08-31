"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ai-coo/ui";

/**
 * Barra de navegación de "islas con muesca" (patrón notch nav, inspirado en
 * adaptive-notch-navigation-bar de 21st.dev — reimplementado desde cero sobre
 * las primitivas y tokens del design system; el código original no es público).
 *
 * Tres islas colgadas del borde superior: logo · items · acciones. Cada isla
 * se funde con el borde mediante filetes de curva invertida. El item activo
 * lleva un pill animado con `layoutId` (spring de Framer Motion).
 *
 * Componente presentacional: no sabe de permisos ni de rutas de la app.
 * El wiring vive en `platform-notch-nav.tsx`.
 */

export type NotchNavLink = {
  type: "link";
  id: string;
  label: string;
  icon?: ReactNode;
  href: string;
  active: boolean;
  /** Contador opcional (p. ej. cantidad de clientes). 0 no se muestra. */
  badge?: number;
};

export type NotchNavMenu = {
  type: "menu";
  id: string;
  label: string;
  icon?: ReactNode;
  active: boolean;
  children: { label: string; href: string; active: boolean }[];
};

export type NotchNavItem = NotchNavLink | NotchNavMenu;

/** Filete de curva invertida que funde la isla con el borde superior. */
function NotchFillet({ side }: { side: "left" | "right" }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={cn(
        "pointer-events-none absolute top-0 h-3 w-3 text-card",
        side === "left" ? "-left-3" : "-right-3 -scale-x-100"
      )}
    >
      <path d="M0 0 C 0 6.63, 5.37 12, 12 12 L 12 0 Z" fill="currentColor" />
    </svg>
  );
}

/** Isla: colgada del borde superior, esquinas inferiores redondeadas. */
function NotchIsland({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-12 items-center rounded-b-2xl border border-t-0 border-border bg-card px-3 shadow-md",
        className
      )}
    >
      <NotchFillet side="left" />
      <NotchFillet side="right" />
      {children}
    </div>
  );
}

const itemBaseClass =
  "relative flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

function ItemChrome({
  active,
  label,
  icon,
  chevron,
  badge,
}: {
  active: boolean;
  label: string;
  icon?: ReactNode;
  chevron?: boolean;
  badge?: number;
}) {
  return (
    <>
      {active && (
        <motion.span
          layoutId="notch-active-pill"
          className="absolute inset-0 rounded-lg bg-sidebar-accent"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}
      <span
        className={cn(
          "relative z-[1] flex items-center gap-1.5",
          active
            ? "text-sidebar-active"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      >
        {icon}
        <span className="hidden whitespace-nowrap xl:inline">{label}</span>
        {badge ? (
          <span className="rounded-full bg-muted px-1.5 text-[10px] font-semibold leading-4 text-muted-foreground">
            {badge}
          </span>
        ) : null}
        {chevron && <ChevronDown className="h-3 w-3 opacity-60" />}
      </span>
    </>
  );
}

export function NotchNav({
  items,
  logo,
  rightContent,
  mobileContent,
}: {
  items: NotchNavItem[];
  logo?: ReactNode;
  rightContent?: ReactNode;
  /** Fila compacta para <md — reemplaza a las islas. */
  mobileContent?: ReactNode;
}) {
  return (
    <header className="relative z-30 shrink-0">
      {/* Desktop: tres islas */}
      <div className="hidden items-start justify-between gap-8 px-6 md:flex">
        {logo ? <NotchIsland className="gap-2">{logo}</NotchIsland> : <div />}

        {items.length > 0 ? (
          <NotchIsland className="min-w-0 gap-0.5">
            <nav aria-label="Navegación principal" className="flex items-center gap-0.5">
              {items.map((item) =>
                item.type === "link" ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    title={item.label}
                    aria-current={item.active ? "page" : undefined}
                    className={cn(itemBaseClass, "group")}
                  >
                    <ItemChrome
                      active={item.active}
                      label={item.label}
                      icon={item.icon}
                      badge={item.badge}
                    />
                  </Link>
                ) : (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger
                      title={item.label}
                      className={cn(itemBaseClass, "group data-[state=open]:text-foreground")}
                    >
                      <ItemChrome
                        active={item.active}
                        label={item.label}
                        icon={item.icon}
                        chevron
                      />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" sideOffset={10}>
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link
                            href={child.href}
                            className={cn(child.active && "text-sidebar-active")}
                          >
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              )}
            </nav>
          </NotchIsland>
        ) : (
          <div />
        )}

        {rightContent ? (
          <NotchIsland className="gap-1.5">{rightContent}</NotchIsland>
        ) : (
          <div />
        )}
      </div>

      {/* Mobile: fila simple con borde inferior */}
      {mobileContent && (
        <div className="flex h-12 items-center justify-between border-b border-border bg-card px-3 md:hidden">
          {mobileContent}
        </div>
      )}
    </header>
  );
}

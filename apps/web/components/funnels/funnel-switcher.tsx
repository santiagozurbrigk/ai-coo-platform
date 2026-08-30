"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Filter } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { paths } from "@/routes/paths";

/**
 * Cambio de embudo sin salir de la vista.
 *
 * ⭐ **Es la razón de ser del módulo**: poder mirar el mismo período en distintos
 * embudos, uno detrás de otro. Volver al índice y entrar de nuevo perdía el
 * período, que es justo lo que hay que sostener para comparar.
 *
 * Por eso el link conserva `period` y el switcher muestra la plantilla de cada
 * embudo: dos instancias del mismo tipo se distinguen por su nombre, y dos tipos
 * distintos no son comparables paso a paso aunque compartan el spine.
 */
export type FunnelSwitcherItem = {
  id: string;
  name: string;
  templateLabel: string;
};

export function FunnelSwitcher({
  current,
  items,
  periodId,
}: {
  current: FunnelSwitcherItem;
  items: FunnelSwitcherItem[];
  periodId: string;
}) {
  const [open, setOpen] = useState(false);

  // Con un solo embudo el selector no ofrece nada: se muestra el nombre y ya.
  if (items.length <= 1) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium">
        <Filter className="h-4 w-4 text-primary" />
        {current.name}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/40"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Filter className="h-4 w-4 text-primary" />
        <span className="max-w-[220px] truncate">{current.name}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <>
          {/* Capa de cierre: un click afuera cierra el menú. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute left-0 z-20 mt-1 w-72 overflow-hidden rounded-xl border border-border bg-card shadow-lg dark:border-glass dark:bg-glass"
          >
            {items.map((item) => {
              const isCurrent = item.id === current.id;
              return (
                <li key={item.id}>
                  <Link
                    href={`${paths.platform.funnels.detail(item.id)}?period=${periodId}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted",
                      isCurrent && "bg-primary/5"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isCurrent ? "text-primary" : "opacity-0"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{item.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.templateLabel}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      ) : null}
    </div>
  );
}

"use client";

/**
 * Checklist de configuración inicial.
 *
 * Todo lo que muestra sale de las tablas reales, no de banderas guardadas: un
 * ítem aparece tildado aunque se haya resuelto por fuera del checklist, y se
 * reabre si el dato desaparece (docs/ONBOARDING_PLAN.md §3).
 */

import { useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Button, cn } from "@ai-coo/ui";
import { NavIcon } from "@/components/navigation/nav-icons";
import { useOnboarding } from "@/providers/onboarding-provider";
import { dismissOnboardingItemAction } from "@/app/onboarding/actions";
import type { OnboardingItemState } from "@/lib/onboarding/derive";

function ChecklistRow({
  item,
  onDismiss,
  dismissing,
}: {
  item: OnboardingItemState;
  onDismiss: () => void;
  dismissing: boolean;
}) {
  return (
    <li className="group flex items-start gap-3 border-t border-border/60 py-3 first:border-t-0">
      <span
        className={cn(
          "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border",
          item.done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-muted-foreground"
        )}
        aria-hidden
      >
        {item.done ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <NavIcon name={item.icon} className="h-3.5 w-3.5" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            item.done && "text-muted-foreground line-through"
          )}
        >
          {item.label}
        </p>
        {!item.done && (
          <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
        )}
      </div>

      {!item.done && (
        <div className="flex shrink-0 items-center gap-1">
          <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
            <Link href={item.href}>
              Ir
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
          {item.dismissible && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
              onClick={onDismiss}
              disabled={dismissing}
              aria-label={`Ocultar "${item.label}"`}
              title="Ocultar"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

export function SetupChecklist() {
  const { state, dismissLocally } = useOnboarding();
  const [dismissing, startDismiss] = useTransition();

  // Sin estado (cuenta invitada, sin Supabase) o todo resuelto: no ocupa lugar.
  if (!state || state.checklist.complete) return null;

  const rows = state.items.filter((i) => i.tier === "checklist" && !i.dismissed);
  const done = rows.filter((i) => i.done).length;
  const pct = rows.length === 0 ? 0 : Math.round((done / rows.length) * 100);

  function handleDismiss(item: OnboardingItemState) {
    // Se oculta al toque; si el servidor falla vuelve en la próxima carga.
    dismissLocally(item.id);
    startDismiss(async () => {
      await dismissOnboardingItemAction(item.id);
    });
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Terminá de configurar tu espacio
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cada paso enciende una parte del sistema. Podés hacerlos en cualquier orden.
          </p>
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          {done} de {rows.length}
        </p>
      </div>

      <div
        className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de configuración"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-2">
        {rows.map((item) => (
          <ChecklistRow
            key={item.id}
            item={item}
            dismissing={dismissing}
            onDismiss={() => handleDismiss(item)}
          />
        ))}
      </ul>
    </section>
  );
}

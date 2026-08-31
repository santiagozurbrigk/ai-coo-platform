"use client";

/**
 * Contador de configuración pendiente, en la isla derecha de la notch nav.
 *
 * Es el único acceso al checklist desde fuera del panel: sin esto, alguien que
 * trabaja todo el día en Marketing no vuelve a enterarse de lo que le falta.
 */

import Link from "next/link";
import { ListChecks } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { useOnboarding } from "@/providers/onboarding-provider";
import { paths } from "@/routes";

export function NotchSetupIndicator() {
  const { state } = useOnboarding();

  if (!state || state.checklist.complete) return null;

  const pending = state.checklist.open.length;
  const label = `Configuración pendiente: ${pending} ${pending === 1 ? "paso" : "pasos"}`;

  return (
    <Button
      asChild
      variant="ghost"
      size="icon"
      className="relative h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
    >
      <Link href={paths.platform.dashboard} aria-label={label} title={label}>
        <ListChecks className="h-4 w-4" />
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium leading-none tabular-nums text-primary-foreground"
          aria-hidden
        >
          {pending}
        </span>
      </Link>
    </Button>
  );
}

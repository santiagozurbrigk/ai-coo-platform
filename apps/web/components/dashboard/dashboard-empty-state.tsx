"use client";

import Link from "next/link";
import { Plug } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { EmptyState } from "@/components/shared/empty-state";
import { useOnboarding } from "@/providers/onboarding-provider";
import { paths } from "@/routes";

export function DashboardEmptyState() {
  const { state } = useOnboarding();

  /*
   * Si el checklist de configuración está arriba, ya le está diciendo qué
   * hacer —con más precisión, porque sabe qué le falta a esta organización—.
   * Repetirlo acá abajo son dos tarjetas pidiendo lo mismo, y la de abajo es
   * la que menos sabe.
   */
  const checklistVisible = Boolean(state && !state.checklist.complete);

  if (checklistVisible) {
    return (
      <EmptyState
        variant="inline"
        icon={<Plug className="h-5 w-5" />}
        title="Todavía no hay datos para mostrar"
        description="El panel se llena solo a medida que completás los pasos de arriba y empiezan a entrar datos."
      />
    );
  }

  return (
    <EmptyState
      icon={<Plug className="h-7 w-7" />}
      title="Conectá tus primeras integraciones"
      // Sin enumerar proveedores: la lista cambia y el texto se queda viejo.
      // La pantalla de Integraciones ya muestra cuáles hay.
      description="El panel general se llena automáticamente con los datos de las herramientas que conectes."
      action={
        <Button asChild>
          <Link href={paths.platform.integrations}>Ir a Integraciones</Link>
        </Button>
      }
    />
  );
}

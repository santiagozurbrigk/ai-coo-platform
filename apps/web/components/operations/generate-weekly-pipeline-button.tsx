"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { triggerWeeklyPipelineAction } from "@/app/executive-reports/report-generation-actions";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToast } from "@/providers/toast-provider";

export function GenerateWeeklyPipelineButton({
  isFounder = false,
  className,
  size = "default",
}: {
  isFounder?: boolean;
  className?: string;
  size?: "default" | "sm";
}) {
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const useSupabase = isSupabaseConfigured();

  if (!isFounder || !useSupabase) return null;

  function handleGenerate() {
    startTransition(async () => {
      try {
        const result = await triggerWeeklyPipelineAction();
        const generated = [
          result.operationsReport === "generated" && "Operaciones",
          result.executiveReport === "generated" && "Reporte ejecutivo",
          result.intelligence === "generated" && "Inteligencia",
        ].filter(Boolean);

        if (generated.length > 0) {
          push({
            title: "Reportes generados",
            description: `Listo: ${generated.join(", ")}.`,
            variant: "success",
          });
        } else if (result.errors.length > 0) {
          push({
            title: "Generación parcial",
            description: result.errors[0],
            variant: "default",
          });
        } else {
          push({
            title: "Sin datos suficientes",
            description:
              "Completá al menos 2 inputs semanales y asegurate de tener actividad en ventas u operaciones.",
            variant: "default",
          });
        }

        router.refresh();
      } catch (error) {
        push({
          title: "No se pudo generar",
          description:
            error instanceof Error ? error.message : "Error al generar reportes.",
          variant: "default",
        });
      }
    });
  }

  return (
    <Button
      type="button"
      size={size}
      className={className ?? "bg-brand-600 hover:bg-brand-700"}
      disabled={pending}
      onClick={handleGenerate}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando…
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generar reporte ahora
        </>
      )}
    </Button>
  );
}

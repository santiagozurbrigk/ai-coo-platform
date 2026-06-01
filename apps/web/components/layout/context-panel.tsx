"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { AiCard, Caption, GlassPanel, Separator, Text } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { flowLinks } from "@/lib/navigation/flow-links";
import { paths } from "@/routes";

const RELATED = [
  { label: "SOP onboarding v2", href: flowLinks.contextRelated("SOP") },
  { label: "Framework ventas Q2", href: flowLinks.contextRelated("Framework") },
  { label: "Ops semanal — 12 mar", href: paths.platform.operations.weeklyInputs },
] as const;

export function ContextPanel({ embedded }: { embedded?: boolean } = {}) {
  const pathname = usePathname();
  const showSalesSnapshot = pathname.startsWith("/sales");

  return (
    <div className={embedded ? "flex flex-col" : "flex h-full flex-col"}>
      <div className="flex-1 space-y-4">
        {showSalesSnapshot && (
          <>
            <GlassPanel className="p-4">
              <Text className="text-xs font-medium text-foreground">Esta semana</Text>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Tasa de agendamiento</span>
                  <span className="font-medium text-success">34,2%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Conv. activas</span>
                  <span className="font-medium text-foreground">128</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Carga del equipo</span>
                  <span className="font-medium text-warning">72%</span>
                </div>
              </div>
            </GlassPanel>
            <Separator />
          </>
        )}

        <AiCard title="Insight rápido" confidence={0.89} source="Inputs + Ventas">
          <span className="ai-insight-text">
            Los tiempos de respuesta en delivery están subiendo.{" "}
            <Link
              href={`${paths.platform.intelligence.root}#bottlenecks`}
              className="text-primary hover:underline"
            >
              Ver cuellos de botella
            </Link>
          </span>
        </AiCard>

        <div className="space-y-2">
          <Caption className="normal-case text-muted-foreground">
            {es.common.related}
          </Caption>
          <ul className="space-y-1 text-xs">
            {RELATED.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 shrink-0 border-t border-border pt-4">
        <Link
          href={`${paths.platform.intelligence.root}#memoria`}
          className="flex items-center gap-2 text-2xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Sparkles className="h-3 w-3 text-primary" />
          <span>Memoria IA · 847 fragmentos</span>
        </Link>
      </div>
    </div>
  );
}

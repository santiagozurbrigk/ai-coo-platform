import { Rocket } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lanzamientos | OTC",
};

export default function LanzamientosPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/40 bg-muted/40 dark:border-white/[0.08] dark:bg-[#1A1A1A]">
        <Rocket className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-medium text-foreground">Lanzamientos</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Planificá, ejecutá y medí el impacto de cada lanzamiento de tu
          negocio. Próximamente.
        </p>
      </div>
      <span className="rounded-full border border-violet-600/20 bg-violet-600/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-violet-400">
        Próximamente
      </span>
    </div>
  );
}

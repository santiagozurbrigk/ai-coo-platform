import type { ReactNode } from "react";
import { PlatformShell } from "@/components/layout/platform-shell";
import { PageContent } from "@/components/layout/page-content";
import { PageTransition } from "@/components/layout/page-transition";

/** Shell de plataforma + transiciones de ruta (Fase 0.7) */
export function PlatformLayout({ children }: { children: ReactNode }) {
  return (
    <PlatformShell>
      <PageContent>
        <PageTransition>{children}</PageTransition>
      </PageContent>
    </PlatformShell>
  );
}

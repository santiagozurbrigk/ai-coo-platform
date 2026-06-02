"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PlatformShell } from "@/components/layout/platform-shell";
import { PageContent } from "@/components/layout/page-content";
import { PageTransition } from "@/components/layout/page-transition";
import { paths } from "@/routes/paths";

/** Shell de plataforma + transiciones de ruta (Fase 0.7) */
export function PlatformLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const agentFullBleed =
    pathname === paths.platform.agent ||
    pathname.startsWith(`${paths.platform.agent}/`);

  return (
    <PlatformShell>
      <PageContent fullWidth={agentFullBleed}>
        <PageTransition>{children}</PageTransition>
      </PageContent>
    </PlatformShell>
  );
}

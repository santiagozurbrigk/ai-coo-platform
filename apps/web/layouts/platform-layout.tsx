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
  const agentRoot = paths.platform.agent.root;
  const agentFullBleed =
    pathname === agentRoot || pathname.startsWith(`${agentRoot}/`);

  return (
    <PlatformShell>
      <PageContent
        fullWidth={agentFullBleed}
        className={agentFullBleed ? "agent-page-content" : undefined}
      >
        {agentFullBleed ? (
          <div className="agent-page-inner">{children}</div>
        ) : (
          <PageTransition>{children}</PageTransition>
        )}
      </PageContent>
    </PlatformShell>
  );
}

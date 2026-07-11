"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PlatformShell } from "@/components/layout/platform-shell";
import { PageContent } from "@/components/layout/page-content";
import { PageTransition } from "@/components/layout/page-transition";
import { paths } from "@/routes/paths";
import type { AiCredentialBannerState } from "@/lib/ai/credential-types";

/** Shell de plataforma + transiciones de ruta (Fase 0.7) */
export function PlatformLayout({
  children,
  aiCredentialBanner,
}: {
  children: ReactNode;
  aiCredentialBanner?: AiCredentialBannerState | null;
}) {
  const pathname = usePathname();

  const fullBleedPrefixes = [
    paths.platform.agent.root,
    paths.platform.sales.inbox,
    paths.platform.product.root,
  ] as const;

  const fullBleed = fullBleedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return (
    <PlatformShell aiCredentialBanner={aiCredentialBanner}>
      <PageContent
        fullWidth={fullBleed}
        className={fullBleed ? "agent-page-content" : undefined}
      >
        {fullBleed ? (
          <div className="agent-page-inner">{children}</div>
        ) : (
          <PageTransition>{children}</PageTransition>
        )}
      </PageContent>
    </PlatformShell>
  );
}

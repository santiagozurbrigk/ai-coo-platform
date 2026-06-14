"use client";

import { Suspense } from "react";
import { Button } from "@ai-coo/ui";
import { HashTabLink, ModuleSubnav } from "@/components/shared/client";
import { PageHeader } from "@/components/shared/page-header";
import { useHashTab } from "@/lib/hooks/use-hash-tab";
import type { SOPOpportunity } from "@/lib/sops/suggest-sops";
import { paths } from "@/routes";
import type { Sop } from "@/types/sops";
import { SopCreatorForm } from "./sop-creator-form";
import { SopLibrary } from "./sop-library";
import { SopsSuggestionsBanner } from "./sops-suggestions-banner";

const TABS = [
  { id: "biblioteca", label: "Biblioteca", hash: "biblioteca" },
  { id: "crear", label: "Crear SOP", hash: "crear" },
] as const;

const DEFAULT_TAB = TABS[0].hash;

export function SopsOverview({
  sops,
  suggestions = [],
}: {
  sops: Sop[];
  suggestions?: SOPOpportunity[];
}) {
  const activeTab = useHashTab(DEFAULT_TAB);
  const root = paths.platform.operations.sops;

  const navTabs = TABS.map((t) => ({
    label: t.label,
    href: `${root}#${t.hash}`,
  }));

  return (
    <div className="space-y-6">
      <ModuleSubnav
        tabs={navTabs}
        isTabActive={(href) => {
          const hash = href.split("#")[1] ?? DEFAULT_TAB;
          return activeTab === hash;
        }}
      />
      {activeTab === "crear" ? (
        <>
          <PageHeader description="Generá un SOP estructurado con IA en minutos" />
          <Suspense
            fallback={
              <p className="text-sm text-muted-foreground">Cargando formulario…</p>
            }
          >
            <SopCreatorForm />
          </Suspense>
        </>
      ) : (
        <>
          <PageHeader
            description="Sistemas operativos vivos de tu negocio"
            actions={
              <Button asChild size="sm" className="bg-violet-600 hover:bg-violet-700">
                <HashTabLink href={`${root}#crear`}>Crear SOP</HashTabLink>
              </Button>
            }
          />
          <SopsSuggestionsBanner suggestions={suggestions} />
          <SopLibrary sops={sops} />
        </>
      )}
    </div>
  );
}

"use client";

import { Button } from "@ai-coo/ui";
import { HashTabLink, ModuleSubnav } from "@/components/shared/client";
import { PageHeader } from "@/components/shared/page-header";
import { useHashTab } from "@/lib/hooks/use-hash-tab";
import { paths } from "@/routes";
import type { Sop } from "@/types/sops";
import { SopCreatorForm } from "./sop-creator-form";
import { SopGrid } from "./sop-grid";

const TABS = [
  { id: "biblioteca", label: "Biblioteca", hash: "biblioteca" },
  { id: "crear", label: "Crear SOP", hash: "crear" },
] as const;

const DEFAULT_TAB = TABS[0].hash;

export function SopsOverview({ sops }: { sops: Sop[] }) {
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
        <SopCreatorForm />
      ) : (
        <>
          <PageHeader
            title="Biblioteca de SOPs"
            description="Sistemas operativos vivos de tu negocio"
            actions={
              <Button asChild size="sm">
                <HashTabLink href={`${root}#crear`}>Crear SOP</HashTabLink>
              </Button>
            }
          />
          <SopGrid sops={sops} />
        </>
      )}
    </div>
  );
}

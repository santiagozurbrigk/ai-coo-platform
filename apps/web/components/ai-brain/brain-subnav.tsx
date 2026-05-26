"use client";

import { usePathname } from "next/navigation";
import { ModuleSubnav } from "@/components/shared/client";
import { paths } from "@/routes";

const TABS = [
  { label: "Panel", href: paths.superAdmin.aiBrain.root },
  { label: "Biblioteca de contenido", href: paths.superAdmin.aiBrain.library },
  { label: "Añadir contenido", href: paths.superAdmin.aiBrain.add },
] as const;

export function BrainSubnav() {
  const pathname = usePathname();

  const isDocDetail =
    pathname.startsWith("/super-admin/ai-brain/") &&
    pathname !== paths.superAdmin.aiBrain.root &&
    pathname !== paths.superAdmin.aiBrain.library &&
    pathname !== paths.superAdmin.aiBrain.add;

  const isTabActive = (href: string) => {
    if (href === paths.superAdmin.aiBrain.root) {
      return pathname === href;
    }
    if (href === paths.superAdmin.aiBrain.library) {
      return pathname === href || isDocDetail;
    }
    return pathname === href;
  };

  return <ModuleSubnav tabs={TABS} isTabActive={isTabActive} />;
}

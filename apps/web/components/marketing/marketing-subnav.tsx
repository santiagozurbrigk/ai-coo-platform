"use client";

import { usePathname } from "next/navigation";
import { ModuleSubnav } from "@/components/shared/client";
import { paths } from "@/routes";

const TABS = [
  { label: "Overview", href: paths.platform.marketing.overview },
  { label: "Contenido", href: paths.platform.marketing.content },
  { label: "Administrar", href: paths.platform.marketing.administrar },
  {
    label: "Conexión con Ventas",
    href: paths.platform.marketing.salesConnection,
  },
  { label: "Formularios", href: paths.platform.marketing.forms },
  { label: "UTMs", href: paths.platform.marketing.utms },
] as const;

export function MarketingSubnav() {
  const pathname = usePathname();

  const isTabActive = (href: string) => {
    if (href === paths.platform.marketing.overview) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return <ModuleSubnav tabs={TABS} isTabActive={isTabActive} />;
}

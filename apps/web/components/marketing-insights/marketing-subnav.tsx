"use client";

import { usePathname } from "next/navigation";
import { ModuleSubnav } from "@/components/shared/client";
import { paths } from "@/routes";

const TABS = [
  { label: "Panel", href: paths.platform.sales.marketingInsights.dashboard },
  { label: "Biblioteca de contenido", href: paths.platform.sales.marketingInsights.library },
] as const;

export function MarketingSubnav() {
  const pathname = usePathname();

  const isTabActive = (href: string) => {
    if (href === paths.platform.sales.marketingInsights.dashboard) {
      return (
        pathname === href ||
        pathname.startsWith("/sales/marketing-insights/content/")
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return <ModuleSubnav tabs={TABS} isTabActive={isTabActive} />;
}

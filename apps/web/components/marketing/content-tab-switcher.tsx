"use client";

import { useRouter, usePathname } from "next/navigation";
import { cn } from "@ai-coo/ui";
import { paths } from "@/routes";

type Tab = "biblioteca" | "borradores";

type Props = {
  activeTab: Tab;
  draftsCount: number;
};

export function ContentTabSwitcher({ activeTab, draftsCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function navigate(tab: Tab) {
    if (tab === "biblioteca") {
      router.push(paths.platform.marketing.content);
    } else {
      router.push(`${paths.platform.marketing.content}?tab=${tab}`);
    }
  }

  const tabClass = (active: boolean) =>
    cn(
      "relative px-4 py-2 text-sm font-medium transition-colors",
      active
        ? "text-foreground"
        : "text-muted-foreground hover:text-foreground"
    );

  return (
    <div className="border-b border-border/60">
      <div className="flex gap-1 -mb-px">
        <button
          type="button"
          onClick={() => navigate("biblioteca")}
          className={tabClass(activeTab === "biblioteca")}
        >
          Biblioteca de contenido
          {activeTab === "biblioteca" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate("borradores")}
          className={tabClass(activeTab === "borradores")}
        >
          Borradores de contenido
          {draftsCount > 0 && (
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                activeTab === "borradores"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {draftsCount}
            </span>
          )}
          {activeTab === "borradores" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>
    </div>
  );
}

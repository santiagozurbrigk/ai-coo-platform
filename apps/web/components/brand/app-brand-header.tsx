"use client";

import { usePathname } from "next/navigation";
import { cn } from "@ai-coo/ui";
import { getPageMeta } from "@/lib/navigation/page-meta";
import { AppLogo } from "./app-logo";

export function AppBrandHeader({ className }: { className?: string }) {
  const pathname = usePathname();
  const { title } = getPageMeta(pathname);

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <AppLogo
        variant="icon"
        display="compact"
        href={undefined}
        height={22}
        className="shrink-0"
      />
      <p className="min-w-0 truncate text-sm font-medium leading-none text-foreground">
        <span className="font-semibold tracking-tight">OTC</span>
        <span className="mx-1.5 text-muted-foreground">|</span>
        <span className="font-normal text-foreground/90">{title}</span>
      </p>
    </div>
  );
}

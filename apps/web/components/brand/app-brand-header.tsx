"use client";

import { usePathname } from "next/navigation";
import { cn } from "@ai-coo/ui";
import { brandAssets } from "@/lib/brand";
import { getPageMeta } from "@/lib/navigation/page-meta";

export function AppBrandHeader({ className }: { className?: string }) {
  const pathname = usePathname();
  const { title } = getPageMeta(pathname);

  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element -- logo estático en /public */}
      <img
        src={brandAssets.logo}
        alt="OTC"
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-lg object-contain"
      />
      <p className="min-w-0 truncate text-sm font-medium leading-none text-foreground">
        <span className="font-semibold tracking-tight">OTC</span>
        <span className="mx-1.5 text-muted-foreground">|</span>
        <span className="font-normal text-foreground/90">{title}</span>
      </p>
    </div>
  );
}

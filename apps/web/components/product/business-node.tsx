"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { getProfileAreaDataAction } from "@/app/profile/actions";

export function BusinessNode({
  registerRef,
}: {
  registerRef?: (el: HTMLDivElement | null) => void;
}) {
  const [orgName, setOrgName] = useState("Mi negocio");

  useEffect(() => {
    getProfileAreaDataAction()
      .then((data) => {
        if (data?.orgName) setOrgName(data.orgName);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div
      ref={registerRef}
      className="absolute z-10 h-36 w-36 -translate-x-1/2 -translate-y-1/2"
      style={{ left: "50%", top: "50%" }}
    >
      <div
        className={cn(
          "relative flex w-36 flex-col items-center gap-3 rounded-2xl border p-5 shadow-sm",
          "border-brand-200 bg-brand-50/95",
          "dark:border-brand-500/40 dark:bg-brand-950/50 dark:shadow-none"
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl border",
            "border-brand-300 bg-brand-100",
            "dark:border-brand-500/50 dark:bg-brand-600/30"
          )}
        >
          <Building2 className="h-5 w-5 text-brand-600 dark:text-brand-300" />
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-900 dark:text-white/90">
            {orgName}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-white/35">
            Centro del negocio
          </p>
        </div>
      </div>
    </div>
  );
}

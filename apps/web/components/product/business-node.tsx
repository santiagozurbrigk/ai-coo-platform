"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import { getProfileAreaDataAction } from "@/app/profile/actions";

export function BusinessNode() {
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
      className="glass-liquid-border absolute flex w-40 -translate-x-1/2 -translate-y-1/2 cursor-default flex-col items-center gap-2 rounded-2xl p-4"
      style={{ left: "50%", top: "50%" }}
    >
      <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-600/20">
        <Building2 className="h-5 w-5 text-violet-500 dark:text-violet-400" />
      </div>
      <div className="relative z-10 text-center">
        <p className="text-xs font-semibold text-slate-900 dark:text-white/90">
          {orgName}
        </p>
        <p className="mt-0.5 text-[10px] text-slate-500 dark:text-white/40">
          Centro del negocio
        </p>
      </div>
    </div>
  );
}

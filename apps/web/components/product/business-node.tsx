"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
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
        className="pointer-events-none absolute inset-0 animate-ping rounded-full border border-violet-500/20 opacity-30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-4 rounded-2xl border border-violet-500/10"
        aria-hidden
      />

      <div className="glass-liquid-border relative flex w-36 flex-col items-center gap-3 rounded-2xl p-5">
        <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/50 bg-violet-600/30">
          <Building2 className="h-5 w-5 text-violet-300" />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-xs font-semibold text-white/90">{orgName}</p>
          <p className="mt-0.5 text-[10px] text-white/35">Centro del negocio</p>
        </div>
      </div>
    </div>
  );
}

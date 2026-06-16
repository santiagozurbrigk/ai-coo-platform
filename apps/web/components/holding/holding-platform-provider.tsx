"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { HoldingSessionState } from "@/lib/holding/session";

const HoldingContext = createContext<HoldingSessionState | null>(null);

export function HoldingPlatformProvider({
  value,
  children,
}: {
  value: HoldingSessionState;
  children: ReactNode;
}) {
  return (
    <HoldingContext.Provider value={value}>{children}</HoldingContext.Provider>
  );
}

export function useHoldingSession(): HoldingSessionState {
  return (
    useContext(HoldingContext) ?? {
      isHolding: false,
      viewingBusiness: false,
      businesses: [],
    }
  );
}

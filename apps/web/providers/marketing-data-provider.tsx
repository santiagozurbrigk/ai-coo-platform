"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getInstagramIntegrationStatusAction } from "@/app/marketing/actions";

type MarketingDataContextValue = {
  instagramConnected: boolean;
  setInstagramConnected: (connected: boolean) => void;
};

const MarketingDataContext = createContext<MarketingDataContextValue | null>(null);

export function MarketingDataProvider({ children }: { children: ReactNode }) {
  const [instagramConnected, setInstagramConnected] = useState(false);

  useEffect(() => {
    getInstagramIntegrationStatusAction()
      .then((data) => {
        setInstagramConnected(data?.status === "active");
      })
      .catch(() => {
        setInstagramConnected(false);
      });
  }, []);

  const setConnected = useCallback((connected: boolean) => {
    setInstagramConnected(connected);
  }, []);

  const value = useMemo(
    () => ({
      instagramConnected,
      setInstagramConnected: setConnected,
    }),
    [instagramConnected, setConnected]
  );

  return (
    <MarketingDataContext.Provider value={value}>
      {children}
    </MarketingDataContext.Provider>
  );
}

export function useMarketingData(): MarketingDataContextValue {
  const ctx = useContext(MarketingDataContext);
  if (!ctx) {
    throw new Error("useMarketingData debe usarse dentro de MarketingDataProvider");
  }
  return ctx;
}

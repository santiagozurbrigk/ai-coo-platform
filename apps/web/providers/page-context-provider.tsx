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
import type { PageContextState } from "@/lib/agent/page-context";

export type { PageContextState, PageEntityType } from "@/lib/agent/page-context";
export { buildPageContextPrompt } from "@/lib/agent/page-context";

type PageContextValue = {
  pageContext: PageContextState | null;
  setPageContext: (context: PageContextState | null) => void;
};

const PageContextCtx = createContext<PageContextValue | null>(null);

export function PageContextProvider({ children }: { children: ReactNode }) {
  const [pageContext, setPageContextState] = useState<PageContextState | null>(
    null
  );

  const setPageContext = useCallback((context: PageContextState | null) => {
    setPageContextState(context);
  }, []);

  const value = useMemo(
    () => ({ pageContext, setPageContext }),
    [pageContext, setPageContext]
  );

  return (
    <PageContextCtx.Provider value={value}>{children}</PageContextCtx.Provider>
  );
}

export function usePageContext() {
  const ctx = useContext(PageContextCtx);
  if (!ctx) {
    throw new Error("usePageContext must be used within PageContextProvider");
  }
  return ctx;
}

export function useOptionalPageContext() {
  return useContext(PageContextCtx);
}

export function PageContextRegistrar({
  context,
  children,
}: {
  context: PageContextState;
  children: ReactNode;
}) {
  const { setPageContext } = usePageContext();

  useEffect(() => {
    setPageContext(context);
    return () => setPageContext(null);
  }, [context, setPageContext]);

  return children;
}

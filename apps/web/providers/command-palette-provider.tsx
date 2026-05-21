"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type CommandPaletteContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const CommandPaletteCtx = createContext<CommandPaletteContextValue | null>(null);

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return (
    <CommandPaletteCtx.Provider value={{ open, setOpen, toggle }}>
      {children}
    </CommandPaletteCtx.Provider>
  );
}

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteCtx);
  if (!ctx) {
    throw new Error(
      "useCommandPalette debe usarse dentro de CommandPaletteProvider"
    );
  }
  return ctx;
}

"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success";
};

type ToastContextValue = {
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastCtx = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (toast: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { ...toast, id }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastCtx.Provider value={{ toasts, push, dismiss }}>
      {children}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de ToastProvider");
  }
  return ctx;
}

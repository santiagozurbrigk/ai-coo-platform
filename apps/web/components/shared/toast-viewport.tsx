"use client";

import { CheckCircle2, X } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";

export function ToastViewport() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 sm:bottom-6 sm:right-6"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "pointer-events-auto animate-fade-in rounded-lg border px-4 py-3 shadow-lg backdrop-blur-md",
            toast.variant === "success"
              ? "border-success/30 bg-card/95"
              : "border-border bg-card/95"
          )}
        >
          <div className="flex items-start gap-3">
            {toast.variant === "success" && (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

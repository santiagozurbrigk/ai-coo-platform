"use client";

import { useTransition } from "react";
import { Store } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { exitBusinessAction } from "@/app/(platform)/holding/actions";
import { useHoldingSession } from "@/components/holding/holding-platform-provider";

export function HoldingViewingBanner() {
  const { isHolding, viewingBusiness, activeBusinessName } = useHoldingSession();
  const [pending, startTransition] = useTransition();

  if (!isHolding || !viewingBusiness) return null;

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-brand-500/20 bg-brand-900/20 px-4 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2 text-brand-700 dark:text-brand-300">
        <Store className="h-4 w-4 shrink-0" />
        <span className="truncate">
          Estás viendo:{" "}
          <span className="font-medium text-brand-800 dark:text-brand-200">
            {activeBusinessName ?? "Negocio"}
          </span>
        </span>
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-7 shrink-0 border-brand-500/30 text-xs"
        disabled={pending}
        onClick={() =>
          startTransition(() => {
            void exitBusinessAction();
          })
        }
      >
        Volver al holding
      </Button>
    </div>
  );
}

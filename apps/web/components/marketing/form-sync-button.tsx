"use client";

import { useTransition } from "react";
import { Button } from "@ai-coo/ui";
import { syncFormAction } from "@/app/forms/actions";
import { useToast } from "@/providers/toast-provider";

export function FormSyncButton({ formId }: { formId: string }) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const res = await syncFormAction(formId);
          if (!res.success) {
            push({ title: res.error, variant: "default" });
            return;
          }
          push({
            title: `Sync: ${res.data.responsesSynced} respuestas · ${res.data.responsesScored} puntuadas`,
            variant: "success",
          });
        })
      }
    >
      {pending ? "Sincronizando…" : "Sincronizar"}
    </Button>
  );
}

"use client";

import { useTransition } from "react";
import { Button } from "@ai-coo/ui";
import { scoreFormResponsesAction, syncFormAction } from "@/app/forms/actions";
import { useToast } from "@/providers/toast-provider";

export function FormsDetailActions({ formId }: { formId: string }) {
  const [pending, startTransition] = useTransition();
  const { push } = useToast();

  return (
    <div className="flex flex-wrap gap-2">
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
              title: `Sync: ${res.data.responsesSynced} respuestas`,
              variant: "success",
            });
          })
        }
      >
        {pending ? "Sincronizando…" : "Sincronizar"}
      </Button>
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await scoreFormResponsesAction(formId);
            if (!res.success) {
              push({ title: res.error, variant: "default" });
              return;
            }
            push({
              title: `${res.data.scored} respuestas puntuadas`,
              variant: "success",
            });
          })
        }
      >
        Puntuar con IA
      </Button>
    </div>
  );
}

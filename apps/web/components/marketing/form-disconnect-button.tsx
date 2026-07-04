"use client";

import { useState, useTransition } from "react";
import { disconnectFormAction } from "@/app/forms/actions";

export function FormDisconnectButton({ formId }: { formId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDisconnect() {
    if (
      !window.confirm(
        "¿Desconectar este formulario? Se eliminarán sus respuestas sincronizadas."
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await disconnectFormAction(formId);
      if (!res.success) {
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleDisconnect}
        disabled={pending}
        className="text-xs text-destructive hover:underline disabled:opacity-50"
      >
        {pending ? "Desconectando…" : "Desconectar"}
      </button>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

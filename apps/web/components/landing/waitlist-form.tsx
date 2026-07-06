"use client";

import { useState } from "react";
import { Button, Input, cn } from "@ai-coo/ui";
import { getStoredUtmData } from "@/components/landing/utm-capture";

type FormState = "idle" | "loading" | "success" | "error";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function WaitlistForm({
  submitLabel = "Quiero mi lugar",
  className,
}: {
  submitLabel?: string;
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setState("error");
      setErrorMessage("Ingresá un email válido.");
      return;
    }

    setState("loading");
    setErrorMessage(null);

    try {
      const utmData = getStoredUtmData();
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          page_url: typeof window !== "undefined" ? window.location.href : undefined,
          ...utmData,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        eventId?: string;
      };

      if (!res.ok || !data.ok) {
        setState("error");
        setErrorMessage(data.error ?? "No pudimos registrarte. Intentá de nuevo.");
        return;
      }

      setState("success");
      setEmail("");
      // Signal the real conversion to Meta (browser pixel).
      // Pass eventID so Meta can deduplicate against the CAPI server-side event.
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "Lead", {}, { eventID: data.eventId });
      }
    } catch {
      setState("error");
      setErrorMessage("Error de conexión. Intentá de nuevo.");
    }
  }

  if (state === "success") {
    return (
      <p
        className={cn(
          "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-4 text-center text-sm text-emerald-400",
          className
        )}
        role="status"
      >
        ¡Estás en la lista! Te avisamos cuando abramos.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className={cn("flex w-full max-w-md flex-col gap-2 sm:flex-row", className)}
    >
      <Input
        type="email"
        name="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
        disabled={state === "loading"}
        required
        className="landing-glass-input h-11 flex-1 text-white placeholder:text-white/40 focus-visible:ring-[#7C3AED]"
        autoComplete="email"
      />
      <Button
        type="submit"
        disabled={state === "loading"}
        className="h-11 shrink-0 rounded-full bg-[#7C3AED] px-6 text-sm font-medium text-white transition-colors hover:bg-[#6D28D9] active:scale-95 disabled:opacity-60"
      >
        {state === "loading" ? "Enviando…" : submitLabel}
      </Button>
      {errorMessage ? (
        <p className="text-sm text-red-400 sm:col-span-2 sm:basis-full" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </form>
  );
}

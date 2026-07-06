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
          ...utmData,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setState("error");
        setErrorMessage(data.error ?? "No pudimos registrarte. Intentá de nuevo.");
        return;
      }

      setState("success");
      setEmail("");
      // Signal the real conversion to Meta (browser pixel).
      // Guard with typeof check so SSR and environments without the pixel are safe.
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "Lead");
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
          "landing-glass glass-liquid-subtle rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center text-sm text-emerald-400",
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
        className="h-11 shrink-0 border border-violet-400/30 bg-[#7C3AED]/90 px-6 shadow-[0_4px_24px_rgba(124,58,237,0.35)] backdrop-blur-sm transition-all duration-150 hover:bg-[#6D28D9] active:scale-95 active:bg-violet-700 active:shadow-[0_0_0_6px_rgba(124,58,237,0.2)]"
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

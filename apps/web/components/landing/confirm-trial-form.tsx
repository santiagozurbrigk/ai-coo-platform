"use client";

import { useState, useEffect } from "react";
import { Input, Button } from "@ai-coo/ui";
import { getStoredUtmData } from "@/components/landing/utm-capture";

type State = "idle" | "loading" | "success" | "error";

const inputClass =
  "landing-glass-input h-12 w-full rounded-xl text-white placeholder:text-white/30 focus-visible:ring-[#7C3AED]";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function ConfirmTrialForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [calendlyEventUrl, setCalendlyEventUrl] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventUri = params.get("calendly_event");
    if (eventUri) setCalendlyEventUrl(eventUri);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) { setError("Ingresá tu nombre."); setState("error"); return; }
    if (!isValidEmail(email)) { setError("Ingresá un email válido."); setState("error"); return; }
    if (!phone.trim()) { setError("Ingresá tu WhatsApp."); setState("error"); return; }

    setState("loading");
    setError(null);

    try {
      const utmData = getStoredUtmData();
      const res = await fetch("/api/trial-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          first_name: name.trim().split(" ")[0] ?? name.trim(),
          last_name: name.trim().split(" ").slice(1).join(" ") || "-",
          phone: phone.trim(),
          instagram: instagram.trim() || undefined,
          calendly_event_url: calendlyEventUrl ?? undefined,
          page_url: typeof window !== "undefined" ? window.location.href : undefined,
          ...utmData,
        }),
      });

      if (!res.ok) {
        setState("error");
        setError("No pudimos guardar tus datos. Intentá de nuevo.");
        return;
      }

      setState("success");

      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        window.fbq("track", "CompleteRegistration");
      }
    } catch {
      setState("error");
      setError("Error de conexión. Intentá de nuevo.");
    }
  }

  if (state === "success") {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15">
          <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          ¡Tu prueba está confirmada!
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/55">
          Ya tenés tu lugar asegurado. Te llega un email con el link de la sesión.
          Nos vemos ahí.
        </p>
        <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/30 px-5 py-2.5 text-sm text-violet-300">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          Revisá tu email para el link de la videollamada
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Header con urgencia */}
      <div className="mb-8 text-center">
        {/* Ícono de advertencia */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/10">
          <svg className="h-7 w-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
          Tu prueba gratis todavía
          <br />
          <span className="text-amber-400">no está confirmada</span>
        </h1>

        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/55 sm:text-base">
          Tu sesión de onboarding está agendada, pero para{" "}
          <strong className="text-white/80">asegurar tu acceso de 3 días</strong>{" "}
          necesitamos algunos datos. Completalos para confirmar tu lugar.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
        <Input
          type="text"
          placeholder="Tu nombre completo"
          value={name}
          onChange={(e) => { setName(e.target.value); if (state === "error") setState("idle"); }}
          disabled={state === "loading"}
          required
          className={inputClass}
          autoComplete="name"
        />
        <Input
          type="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
          disabled={state === "loading"}
          required
          className={inputClass}
          autoComplete="email"
        />
        <Input
          type="tel"
          placeholder="WhatsApp (con código de país, ej: +54 9 11...)"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); if (state === "error") setState("idle"); }}
          disabled={state === "loading"}
          required
          className={inputClass}
          autoComplete="tel"
        />
        <Input
          type="text"
          placeholder="@ de Instagram (opcional)"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          disabled={state === "loading"}
          className={inputClass}
          autoComplete="off"
        />

        {error ? (
          <p className="text-sm text-red-400" role="alert">{error}</p>
        ) : null}

        <Button
          type="submit"
          disabled={state === "loading"}
          className="mt-2 h-12 w-full rounded-full bg-[#7C3AED] text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-60"
        >
          {state === "loading" ? "Confirmando…" : "Confirmar mi prueba gratis"}
        </Button>
      </form>

      <p className="mt-4 text-center text-xs text-white/30">
        Tus datos están seguros y nunca serán compartidos con terceros.
      </p>
    </div>
  );
}

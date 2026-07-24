"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Input, cn } from "@ai-coo/ui";
import { getStoredUtmData } from "@/components/landing/utm-capture";

type BookingState = "calendly" | "thank_you" | "form_submitted";

function CalendlyWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingScript = document.getElementById("calendly-widget-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "calendly-widget-script";
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="calendly-inline-widget w-full rounded-3xl overflow-hidden"
      data-url="https://calendly.com/optimizatucontrol/30min?hide_gdpr_banner=1&background_color=0d0d0d&text_color=ffffff&primary_color=7C3AED"
      style={{ minWidth: 320, height: 700 }}
    />
  );
}

function ThankYouForm({ onSubmit }: { onSubmit: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [instagram, setInstagram] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Completá tu nombre y email.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const utmData = getStoredUtmData();
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          first_name: name.trim().split(" ")[0] ?? name.trim(),
          last_name: name.trim().split(" ").slice(1).join(" ") || "-",
          phone: "-",
          instagram: instagram.trim() || undefined,
          monthly_revenue: "trial_signup",
          team_size: "-",
          operational_pain: "Trial signup via landing",
          why_now: "Agendó onboarding",
          page_url: typeof window !== "undefined" ? window.location.href : undefined,
          ...utmData,
        }),
      });
    } catch {
      // non-critical — call is already booked
    }

    setLoading(false);
    onSubmit();
  }

  const inputClass =
    "landing-glass-input h-11 w-full text-white placeholder:text-white/40 focus-visible:ring-[#7C3AED]";

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4 text-left">
      <Input
        type="text"
        placeholder="Tu nombre completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        required
        className={inputClass}
        autoComplete="name"
      />
      <Input
        type="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
        className={inputClass}
        autoComplete="email"
      />
      <Input
        type="text"
        placeholder="@ de Instagram (opcional)"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        disabled={loading}
        className={inputClass}
        autoComplete="off"
      />
      {error ? (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-full bg-[#7C3AED] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Confirmar mis datos"}
      </Button>
    </form>
  );
}

export function TrialBookingSection() {
  const [state, setState] = useState<BookingState>("calendly");

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (
        typeof e.data === "object" &&
        e.data !== null &&
        e.data.event === "calendly.event_scheduled"
      ) {
        setState("thank_you");
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <section
      id="agendar"
      className="scroll-mt-8 border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40"
    >
      <div className="mx-auto max-w-4xl">
        {state === "calendly" && (
          <>
            <div className="mb-12 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
                PRUEBA GRATUITA
              </div>
              <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
                Agendá tu sesión
                <br />
                <span className="text-[#7C3AED]">de onboarding gratis</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
                Es una videollamada de 30 minutos. Conectamos tus herramientas en vivo
                y te dejamos 3 días de acceso completo a OTC, sin tarjeta de crédito.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                {["30 min de onboarding personalizado", "3 días de acceso completo", "Sin tarjeta de crédito"].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-white/60"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <CalendlyWidget />
          </>
        )}

        {state === "thank_you" && (
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-3xl">
              ✓
            </div>
            <h2 className="text-4xl font-black tracking-[-0.03em]">
              ¡Tu sesión está confirmada!
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/60">
              Te llega un email de confirmación con el link. Mientras tanto, dejanos
              tus datos para preparar todo antes de la sesión.
            </p>
            <ThankYouForm onSubmit={() => setState("form_submitted")} />
          </div>
        )}

        {state === "form_submitted" && (
          <div className="mx-auto max-w-lg text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/10 text-3xl">
              ✓
            </div>
            <h2 className="text-4xl font-black tracking-[-0.03em]">
              Todo listo.
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-white/60">
              Nos vemos en la sesión. Si tenés alguna duda antes, escribinos por
              Instagram.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

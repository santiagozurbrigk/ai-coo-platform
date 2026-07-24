"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

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

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (
        typeof e.data === "object" &&
        e.data !== null &&
        e.data.event === "calendly.event_scheduled"
      ) {
        window.location.href = "/prueba";
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
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

export function TrialBookingSection() {
  return (
    <section
      id="agendar"
      className="scroll-mt-8 border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40"
    >
      <div className="mx-auto max-w-4xl">
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
      </div>
    </section>
  );
}

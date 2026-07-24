"use client";

import { VslPlayer } from "./vsl-player";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-0 pt-20 sm:px-6 sm:pt-32 md:pt-44">
      {/* Text content — constrained */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-2 text-center sm:px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]">
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          Prueba gratuita · 3 días · Sin tarjeta
        </div>

        {/* Headline */}
        <h1 className="mt-7 text-4xl font-black leading-[1.05] tracking-[-0.02em] sm:text-5xl md:text-[56px]">
          El sistema operativo para
          <br />
          tu{" "}
          <em className="text-[#7C3AED] not-italic">
            infoproducto
          </em>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-5 max-w-lg text-base font-normal leading-relaxed text-white/55 md:text-lg">
          Ventas, clientes, marketing, finanzas y operaciones en un solo lugar.
          Probalo 3 días gratis con onboarding personalizado incluido.
        </p>

        {/* CTA */}
        <div className="mt-8">
          <a
            href="#agendar"
            className="inline-block w-full max-w-[240px] rounded-full bg-[#7C3AED] px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-colors hover:bg-[#6D28D9] sm:w-auto"
          >
            Empezá gratis ahora
          </a>
        </div>

        {/* Social proof */}
        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-white/45">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
          Más founders conectan OTC cada semana
        </p>
      </div>

      {/* VSL — full width, breaks out of text container */}
      <div className="relative z-10 mx-auto mt-16 w-full max-w-5xl px-2 sm:px-4">
        <VslPlayer />
      </div>
    </section>
  );
}

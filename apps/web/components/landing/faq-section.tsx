"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "¿La prueba gratis es realmente gratis?",
    answer:
      "Sí. No pedimos tarjeta de crédito. 3 días de acceso completo a OTC, sin costo y sin compromiso. Si querés continuar, te contamos los planes después del onboarding.",
  },
  {
    question: "¿Qué pasa en la sesión de onboarding?",
    answer:
      "Es una videollamada de 30 minutos donde conectamos tus integraciones en vivo: Calendly, Instagram, Zernio, gastos y equipo. Salís de la llamada con OTC funcionando con datos reales de tu negocio.",
  },
  {
    question: "¿Necesito saber de tecnología?",
    answer:
      "No. El onboarding es guiado, lo hacemos nosotros con vos. Vos explicás tu negocio, nosotros configuramos el sistema.",
  },
  {
    question: "¿Qué herramientas se conectan?",
    answer:
      "Calendly, Instagram (vía Zernio), Fathom, Discord, Google Drive, Typeform, Google Forms, Mercado Pago y más. Si usás algo que no está en la lista, lo vemos en el onboarding.",
  },
  {
    question: "¿Cuánto tiempo tarda ver resultados?",
    answer:
      "El primer día ya tenés métricas reales de tu negocio. En los 3 días de prueba podés ver facturación, tasa de cierre, contenido con atribución y el agente IA respondiendo sobre tu negocio.",
  },
  {
    question: "¿Qué pasa cuando terminan los 3 días?",
    answer:
      "Te contactamos para contarte los planes. Si decidís no continuar, no pasa nada. Sin presiones, sin cobros automáticos.",
  },
] as const;

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
            PREGUNTAS FRECUENTES
          </div>
          <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
            Preguntas frecuentes
          </h2>
        </div>

        <ul className="divide-y divide-white/[0.06]">
          {FAQ_ITEMS.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;
            return (
              <li key={question}>
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between py-5 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="pr-4 text-base font-semibold text-white">
                    {question}
                  </span>
                  <span className="shrink-0 text-xl text-violet-400">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? "300px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <p className="pb-5 pr-8 text-sm leading-relaxed text-white/55">
                    {answer}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "¿Necesito saber de tecnología para usar OTC?",
    answer:
      "No. El onboarding es guiado y la IA hace el trabajo pesado. Vos configurás tus reglas en lenguaje natural.",
  },
  {
    question: "¿Qué pasa si ya uso otras herramientas?",
    answer:
      "OTC se conecta a lo que ya usás: Calendly, Instagram, Fathom, Discord, Stripe y más. No tenés que cambiar todo, solo centralizarlo.",
  },
  {
    question: "¿Cuánto tiempo tarda el onboarding?",
    answer:
      "El primer día ya tenés las integraciones conectadas y el Agente de negocio configurado. La primera semana ya tenés reportes reales.",
  },
  {
    question: "¿Mis datos y los de mis clientes están seguros?",
    answer:
      "Sí. Todo corre sobre infraestructura encriptada. Nunca compartimos ni vendemos datos de tu negocio.",
  },
  {
    question: "¿Los 10 cupos son definitivos?",
    answer:
      "Son los primeros 10 cupos de acceso anticipado con soporte personalizado. Cuando escalemos, habrá más lugares, pero a otro precio.",
  },
  {
    question: "¿Hay garantía o período de prueba?",
    answer:
      "Sí. Si en los primeros 14 días sentís que OTC no era lo que esperabas, te devolvemos el 100%.",
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
            Lo que siempre preguntan
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
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
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
                    maxHeight: isOpen ? "240px" : "0px",
                    overflow: "hidden",
                    transition: "max-height 0.3s ease",
                  }}
                >
                  <p className="mt-0 pr-8 text-sm leading-relaxed text-white/55">
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

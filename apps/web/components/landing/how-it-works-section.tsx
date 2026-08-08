const STEPS = [
  {
    number: "1",
    label: "HOY",
    title: "Agendás la sesión",
    desc: "Elegís un horario en el calendario de abajo. Son 30 minutos por videollamada, sin costo. Te confirmamos en el momento.",
  },
  {
    number: "2",
    label: "EN LA SESIÓN",
    title: "Conectamos todo juntos",
    desc: "En la videollamada conectamos tus integraciones: Calendly, Instagram vía Zernio, gastos y tu equipo. En 30 min tenés OTC funcionando con datos reales de tu negocio.",
  },
  {
    number: "3",
    label: "3 DÍAS COMPLETOS",
    title: "Usás OTC con acceso total",
    desc: "Desde el momento del onboarding tenés 3 días de acceso completo. Ventas, clientes, marketing, finanzas, agente IA. Todo desbloqueado, sin tarjeta.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section className="border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
            CÓMO FUNCIONA LA PRUEBA
          </div>
          <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
            De cero a operativo
            <br />
            <span className="text-[#7C3AED]">en 30 minutos</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
            No hay setup manual, no hay semana de integración. El onboarding es
            en vivo y te dejamos todo funcionando antes de colgar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ number, label, title, desc }) => (
            <div
              key={number}
              className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 pt-10"
            >
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-950/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-violet-400">
                {label}
              </div>
              <div className="mt-2 text-8xl font-black leading-none text-violet-500/15">
                {number}
              </div>
              <h3 className="mb-3 mt-2 text-xl font-black">{title}</h3>
              <p className="text-sm leading-relaxed text-white/55">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="#agendar"
            className="inline-block rounded-full bg-[#7C3AED] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#6D28D9]"
          >
            Agendá tu sesión gratis
          </a>
        </div>
      </div>
    </section>
  );
}

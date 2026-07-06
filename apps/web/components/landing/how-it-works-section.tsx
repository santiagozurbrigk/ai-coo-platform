const STEPS = [
  {
    number: "1",
    title: "Conectá",
    desc: "Conectá todas las plataformas que usás, de forma simple. Llamadas, Instagram, formularios, Calendly, Discord.",
  },
  {
    number: "2",
    title: "Analizá",
    desc: "La IA analiza cualquier parte de tu negocio: ventas, marketing, finanzas, producto y clientes. Lee llamadas, contenido, documentos y conversaciones, y arma el contexto completo de tu negocio en tiempo real.",
  },
  {
    number: "3",
    title: "Actuá",
    desc: "Recibí tareas, alertas y recomendaciones sobre cualquier área de tu negocio. La IA no solo te muestra información: te dice qué hacer con ella, en cada área, todo el tiempo.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
            CÓMO FUNCIONA
          </div>
          <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
            Conectá. Analizá. Actuá.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-white/60 md:text-lg">
            Tres pasos para pasar del caos operativo a un negocio que se gestiona
            solo.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ number, title, desc }) => (
            <div
              key={number}
              className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 pt-10"
            >
              <div className="mb-4 text-8xl font-black leading-none text-violet-500/15">
                {number}
              </div>
              <h3 className="mb-3 text-xl font-black">{title}</h3>
              <p className="text-sm leading-relaxed text-white/55">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

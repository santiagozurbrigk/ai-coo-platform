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
    <section className="px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-950/30 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-violet-400">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Cómo funciona
        </div>

        <h2 className="max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
          Tu negocio, entendido y convertido en un plan de acción
        </h2>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map(({ number, title, desc }) => (
            <div
              key={number}
              className="rounded-2xl border border-white/10 bg-white/[0.02] p-8"
            >
              <div className="mb-6 text-5xl font-semibold leading-none tracking-tighter text-violet-500/30">
                {number}
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/50">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

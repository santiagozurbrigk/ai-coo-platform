import { brand } from "@/lib/brand";


const PAINS = [
  {
    title: "No sabés qué está pasando en tu negocio",
    desc: "Tus métricas están en planillas, en apps distintas o en tu cabeza. Cada vez que necesitás un número, perdés una hora buscándolo.",
  },
  {
    title: "Cerrás llamadas sin saber qué falló en las otras",
    desc: "La misma objeción aparece en cada llamada y tu equipo no la identifica. Perdés ventas que podrían evitarse con un análisis básico.",
  },
  {
    title: "Publicás contenido sin saber qué trajo clientes",
    desc: "Subís reels, crecen las vistas, pero no podés conectar ningún post con un cierre real. Creás sin datos.",
  },
  {
    title: "Tus finanzas son un misterio hasta fin de mes",
    desc: "No sabés tu margen real. Mezclás facturación con cash collected. Los gastos aparecen cuando ya es tarde.",
  },
  {
    title: "Tu equipo sale de la reunión sin un plan claro",
    desc: "Las tareas quedan en el aire. Los SOPs no se siguen. Cada proceso depende de que vos estés presente.",
  },
  {
    title: "Usás 10 herramientas y ninguna se habla con otra",
    desc: "Calendly, Notion, Drive, Instagram, planillas, Discord. Todo por separado, sin visión unificada de tu negocio.",
  },
] as const;

export function ProblemsSection() {
  return (
    <section className="border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-400">
            ¿TE PASA ESTO?
          </div>
          <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
            Todo lo que hoy
            <br />
            se te escapa
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
            Cada área de tu negocio corriendo sola, sin datos claros, sin visión
            unificada. {brand.name} las conecta todas.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PAINS.map(({ title, desc }) => (
            <div
              key={title}
              className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8"
            >
              <div className="mb-2 h-1 w-8 rounded-full bg-brand-500/40" />
              <h3 className="mt-4 text-lg font-black leading-snug">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="#agendar"
            className="inline-block rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Empezá gratis ahora
          </a>
          <p className="mt-3 text-sm text-white/40">
            3 días gratis · Sin tarjeta de crédito · Onboarding incluido
          </p>
        </div>
      </div>
    </section>
  );
}

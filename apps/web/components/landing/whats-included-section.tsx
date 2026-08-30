import { brand } from "@/lib/brand";


const MODULES = [
  {
    icon: "◈",
    label: "Ventas",
    title: "Cerrá más sin trabajar más",
    items: [
      "Llamadas de Calendly sincronizadas automáticamente",
      "Análisis IA de cada llamada con Fathom",
      "Tasa de cierre, show rate y objeciones frecuentes",
      "Inbox de DMs conectado con contexto del lead",
    ],
  },
  {
    icon: "◈",
    label: "Clientes",
    title: "Control total de tu cartera",
    items: [
      "CRM con historial completo de cada cliente",
      "Cuotas pendientes y pagos por cobrar",
      "Timeline de la relación desde el primer contacto",
      "Estado en tiempo real: activo, pausado, terminado",
    ],
  },
  {
    icon: "◈",
    label: "Marketing",
    title: "Sabé qué contenido trae clientes",
    items: [
      "Posts de Instagram conectados a métricas reales",
      "Qué reel generó leads, llamadas y cierres",
      "Inbox de comentarios y DMs centralizado",
      "Sync automático desde Zernio",
    ],
  },
  {
    icon: "◈",
    label: "Finanzas",
    title: "Tu margen en tiempo real",
    items: [
      "Facturación vs cash collected del período",
      "Gastos fijos, suscripciones y equipo en un lugar",
      "Margen real con objetivo del 60%",
      "Por cobrar: cuotas pendientes por mes",
    ],
  },
  {
    icon: "◈",
    label: "Agente IA",
    title: "Un COO de IA que conoce tu negocio",
    items: [
      "Chat con contexto completo de tu empresa",
      "Responde sobre ventas, clientes, contenido y finanzas",
      "Propone tareas, alertas y prioridades",
      "Usa tus SOPs, documentos y datos reales",
    ],
  },
  {
    icon: "◈",
    label: "Operaciones",
    title: "Escalá sin perder el control",
    items: [
      "SOPs documentados y accesibles para tu equipo",
      "Tablero de tareas y sprints semanales",
      "Reportes ejecutivos automáticos",
      "Snapshots de inteligencia del negocio",
    ],
  },
] as const;

export function WhatsIncludedSection() {
  return (
    <section className="border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-400">
            QUÉ INCLUYE LA PRUEBA
          </div>
          <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
            Todo desbloqueado
            <br />
            <span className="text-primary">desde el día 1</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
            No es un demo recortado. Los 3 días de prueba incluyen acceso completo a
            todos los módulos de {brand.name}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map(({ label, title, items }) => (
            <div
              key={label}
              className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8"
            >
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-400">
                {label}
              </div>
              <h3 className="mt-4 text-lg font-black leading-tight">{title}</h3>
              <ul className="mt-4 space-y-2">
                {items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-relaxed text-white/55"
                  >
                    <span className="mt-0.5 shrink-0 text-brand-400">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

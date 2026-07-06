const INTEGRATIONS = [
  { name: "Calendly", desc: "Agendamiento" },
  { name: "Instagram", desc: "Conversaciones" },
  { name: "Fathom", desc: "Llamadas" },
  { name: "Discord", desc: "Comunidad" },
  { name: "Stripe", desc: "Pagos" },
  { name: "MercadoPago", desc: "Pagos" },
  { name: "Typeform", desc: "Formularios" },
  { name: "YouTube", desc: "Contenido" },
] as const;

export function IntegrationsSection() {
  return (
    <section className="border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
            INTEGRACIONES
          </div>
          <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
            OTC funciona donde ya trabajás
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-white/60 md:text-lg">
            Conectamos las herramientas que ya usás para que tu negocio hable en
            un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {INTEGRATIONS.map(({ name, desc }) => (
            <div
              key={name}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center"
            >
              <p className="text-sm font-semibold text-white">{name}</p>
              <p className="mt-1 text-xs text-white/40">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-violet-500/20 bg-violet-950/40 p-8 text-center">
          <p className="text-base font-medium text-violet-100 md:text-lg">
            ¿Tu herramienta no está? La conectamos en el onboarding.
          </p>
          <a
            href="#waitlist"
            className="mt-6 inline-block rounded-full bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9]"
          >
            Quiero mi lugar
          </a>
        </div>
      </div>
    </section>
  );
}

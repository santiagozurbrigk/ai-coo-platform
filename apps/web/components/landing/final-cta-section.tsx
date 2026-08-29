import { brand } from "@/lib/brand";


export function FinalCtaSection() {
  return (
    <section className="border-y border-primary/10 bg-primary/5 px-4 py-32 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-5xl font-black tracking-tight md:text-7xl">
          Probalo gratis.
          <br />
          <span className="text-primary">Sin tarjeta.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/60">
          Agendá una sesión de onboarding de 30 minutos y salís con {brand.name} funcionando
          con datos reales de tu negocio. 3 días de acceso completo, gratis.
        </p>

        <a
          href="#agendar"
          className="mt-10 inline-block rounded-full bg-primary px-10 py-4 text-base font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Agendá tu sesión gratis
        </a>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {["Sin tarjeta de crédito", "Onboarding 1:1 incluido", "3 días de acceso completo"].map(
            (item) => (
              <span key={item} className="flex items-center gap-1.5 text-sm text-white/40">
                <span className="h-1 w-1 rounded-full bg-violet-400" />
                {item}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}

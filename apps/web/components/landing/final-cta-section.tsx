import { WaitlistForm } from "./waitlist-form";

export function FinalCtaSection() {
  return (
    <section className="border-y border-[#7C3AED]/10 bg-[#7C3AED]/5 px-4 py-32 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-5xl font-black tracking-tight md:text-7xl">
          Ya construiste algo grande.
          <br />
          Ahora escalalo.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/60">
          OTC entra a tu negocio, entiende cómo funciona y empieza a darte
          claridad y acción desde el día 1.
        </p>
        <WaitlistForm
          submitLabel="Aplicar a un cupo"
          className="mx-auto mt-10 justify-center"
        />
        <p className="mt-6 text-sm text-white/40">
          Solo 10 cupos · Sin permanencia mínima
        </p>
      </div>
    </section>
  );
}

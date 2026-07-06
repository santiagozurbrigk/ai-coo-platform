import { WaitlistForm } from "./waitlist-form";

export function FinalCtaSection() {
  return (
    <section className="px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-8 py-16 text-center md:px-16 md:py-20">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-950/30 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-violet-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Solo 10 cupos
          </div>

          <p className="mx-auto max-w-lg text-lg leading-relaxed text-white/70">
            Por ahora damos soporte personalizado a solo{" "}
            <span className="font-semibold text-[#7C3AED]">10 negocios</span>{" "}
            mientras terminamos de pulir el producto. Los cupos son limitados.
          </p>

          <div className="mt-10">
            <WaitlistForm
              submitLabel="Aplicar a un cupo"
              className="mx-auto justify-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

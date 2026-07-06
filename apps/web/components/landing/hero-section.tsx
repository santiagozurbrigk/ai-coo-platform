import { VslPlayer } from "./vsl-player";
import { WaitlistForm } from "./waitlist-form";

export function HeroSection() {
  return (
    <section className="px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-950/30 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-violet-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Lanzamiento 10/7
          </div>

          {/* Headline */}
          <h1 className="max-w-3xl text-5xl font-semibold leading-none tracking-[-0.04em] sm:text-6xl md:text-7xl">
            El segundo cerebro para{" "}
            <span className="text-[#7C3AED]">infoproductores</span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/55">
            Conectá ventas, marketing, finanzas, producto y clientes en un solo
            lugar. Y escalá sin perder el control.
          </p>

          {/* VSL Player */}
          <div className="mt-12 w-full max-w-3xl">
            <VslPlayer />
          </div>

          {/* Waitlist form */}
          <div id="waitlist" className="mt-10 w-full scroll-mt-24">
            <WaitlistForm className="mx-auto justify-center" />
          </div>

          {/* Microcopy */}
          <p className="mt-4 text-sm text-white/40">
            Solo 10 cupos limitados. Completá el formulario para aplicar.
          </p>
        </div>
      </div>
    </section>
  );
}

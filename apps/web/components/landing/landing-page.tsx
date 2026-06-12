import Link from "next/link";
import {
  BarChartHorizontal,
  Brain,
  FileText,
  FileX,
  MessageSquare,
  MessageSquareX,
  Plug,
  UserX,
} from "lucide-react";
import { paths } from "@/routes";
import { LandingGlass } from "./landing-glass";
import { VslPlayer } from "./vsl-player";
import { WaitlistForm } from "./waitlist-form";

const PAINS = [
  {
    icon: MessageSquareX,
    title: "No sabés por qué ghostean",
    desc: "Tu setter tuvo 40 conversaciones. Cerró 3. No sabés qué falló en las otras 37.",
  },
  {
    icon: FileX,
    title: "Los SOPs no existen",
    desc: "Cada nuevo empleado aprende de cero porque nadie documentó nada.",
  },
  {
    icon: BarChartHorizontal,
    title: "Sin visibilidad operacional",
    desc: "No sabés qué hace tu equipo ni dónde se pierde el tiempo hasta que ya es tarde.",
  },
  {
    icon: UserX,
    title: "Todo pasa por vos",
    desc: "Tu equipo no puede tomar decisiones sin consultarte. Sos el cuello de botella.",
  },
] as const;

const FEATURES = [
  {
    icon: Brain,
    title: "Dashboard ejecutivo en 30 segundos",
    desc: "Cada mañana: qué pasó, por qué pasó, y qué deberías hacer hoy. Sin reportes manuales.",
  },
  {
    icon: MessageSquare,
    title: "Análisis de ventas call por call",
    desc: "La IA analiza cada conversación: ghosting signals, objeciones, booking rate por setter.",
  },
  {
    icon: FileText,
    title: "SOPs generados automáticamente",
    desc: "Detecta procesos repetidos y genera documentación que evoluciona con tu negocio.",
  },
  {
    icon: Plug,
    title: "Todo conectado: ManyChat, Fathom, Calendly y más",
    desc: "Un solo lugar para ventas, operaciones, finanzas y equipo. Sin copiar y pegar entre tools.",
  },
] as const;

const WAITLIST_AVATARS = ["AG", "MR", "SL", "JP", "VC"];

export function LandingPage() {
  return (
    <>
      <LandingGlass
        as="header"
        className="sticky top-0 z-50 rounded-none border-x-0 border-t-0 border-b border-glass bg-[#0A0A0A]/70 backdrop-blur-lg"
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="text-sm font-semibold tracking-tight">
            Optimiza Tu Control
          </span>
          <div className="flex items-center gap-4">
            <Link
              href={paths.platform.dashboard}
              className="text-sm text-white/50 transition-colors hover:text-white/80"
            >
              Iniciar sesión
            </Link>
            <a
              href="#waitlist"
              className="inline-flex h-9 items-center rounded-lg border border-violet-400/30 bg-[#7C3AED]/90 px-4 text-sm font-medium text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] backdrop-blur-sm transition-all duration-150 hover:bg-[#6D28D9] active:scale-95 active:bg-violet-700 active:shadow-[0_0_0_4px_rgba(124,58,237,0.2)]"
            >
              Unirme a la waitlist
            </a>
          </div>
        </div>
      </LandingGlass>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="mb-16 sm:mb-20">
          <VslPlayer />
        </section>

        <section className="mb-20 flex flex-col items-center text-center sm:mb-28">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-900/20 px-3 py-1 text-xs text-violet-400 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
            Lanzamiento limitado · 20 cupos
          </span>

          <h1 className="max-w-3xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            El sistema operativo de tu negocio de{" "}
            <span className="text-[#7C3AED]">infoproductos</span>
          </h1>

          <p className="mt-5 max-w-lg text-base text-white/50">
            Conectás tus herramientas, la IA analiza todo, y cada mañana sabés
            exactamente qué está pasando, por qué, y qué hacer.
          </p>

          <div id="waitlist" className="mt-8 w-full scroll-mt-24">
            <WaitlistForm className="mx-auto justify-center" />
          </div>

          <p className="mt-3 text-xs text-white/40">
            Sin tarjeta. Sin compromiso. Early access con descuento.
          </p>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {WAITLIST_AVATARS.map((initials) => (
                <div
                  key={initials}
                  className="landing-glass glass-liquid-subtle flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0A0A0A]/80 text-[10px] font-medium text-white/70"
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/50">
              47 founders ya en lista de espera
            </p>
          </div>
        </section>

        <section className="mb-20 sm:mb-28">
          <p className="text-xs font-medium uppercase tracking-widest text-[#7C3AED]">
            El problema
          </p>
          <h2 className="mt-3 text-2xl font-medium sm:text-3xl">
            Tu negocio crece, el caos también
          </h2>
          <p className="mt-3 max-w-2xl text-white/50">
            Cuando llegás a $30k-$100k/mes, la información está en 10 lugares
            distintos y nunca sabés qué pasa de verdad.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {PAINS.map(({ icon: Icon, title, desc }) => (
              <LandingGlass
                key={title}
                className="rounded-xl p-4 transition-all duration-200 hover:bg-glass-hover hover:border-glass-strong"
              >
                <div className="landing-icon-well inline-flex rounded-lg p-2">
                  <Icon className="h-5 w-5 text-[#7C3AED]" strokeWidth={1.5} />
                </div>
                <h3 className="mt-3 text-sm font-medium">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {desc}
                </p>
              </LandingGlass>
            ))}
          </div>
        </section>

        <section className="mb-20 sm:mb-28">
          <p className="text-xs font-medium uppercase tracking-widest text-[#7C3AED]">
            La solución
          </p>
          <h2 className="mt-3 text-2xl font-medium sm:text-3xl">
            Un COO de IA que entiende tu negocio
          </h2>
          <p className="mt-3 max-w-2xl text-white/50">
            Conectás tus herramientas una sola vez. La IA aprende cómo funciona
            tu negocio y te da inteligencia accionable todos los días.
          </p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <LandingGlass
                key={title}
                as="li"
                className="flex gap-4 rounded-xl p-4 transition-all duration-200 hover:bg-glass-elevated"
              >
                <div className="landing-icon-well flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Icon className="h-5 w-5 text-[#7C3AED]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-sm font-medium">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/50">
                    {desc}
                  </p>
                </div>
              </LandingGlass>
            ))}
          </ul>
        </section>

        <section className="mb-16">
          <LandingGlass className="rounded-xl border border-glass bg-glass-elevated px-6 py-10 backdrop-blur-xl sm:px-10 sm:py-14">
            <h2 className="text-2xl font-medium sm:text-3xl">
              20 cupos para el primer lanzamiento
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
              Precio de lanzamiento exclusivo para los primeros founders. La
              lista cierra cuando se llena.
            </p>
            <WaitlistForm
              submitLabel="Reservar mi lugar"
              className="mx-auto mt-8 justify-center"
            />
            <p className="mt-4 text-xs text-white/40">
              Setup incluido · Onboarding personalizado · Soporte directo
            </p>
          </LandingGlass>
        </section>
      </div>

      <LandingGlass
        as="footer"
        className="rounded-none border-x-0 border-b-0 py-8 text-center text-xs text-white/40"
      >
        © 2026 Optimiza Tu Control · optimizatucontrol.com
      </LandingGlass>
    </>
  );
}

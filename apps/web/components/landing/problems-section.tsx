"use client";

import { useEffect, useRef, useState } from "react";

const PROBLEMS = [
  {
    title: "Leads descalificados que igual llegan a la llamada",
    desc: "La IA cruza el chat del lead con tus estándares de agendamiento y el contexto del lead, y te avisa en el momento si esa persona no califica. Tu equipo solo habla con gente que sí puede cerrar.",
    image: "/screenshots/problem-1.png",
  },
  {
    title: "La misma objeción se repite y tu closer la sigue perdiendo",
    desc: "La IA escucha cada llamada y arma un reporte automático de las objeciones más frecuentes, separando dudas de oferta, de contenido y de venta real. Dejás de perder la misma venta dos veces.",
    image: "/screenshots/problem-2.png",
  },
  {
    title: "No sabés cuál de tus últimos 10 reels te trajo un cliente de verdad",
    desc: "Conectamos cada pieza de contenido con los leads, llamadas, cierres y dinero que generó. Sabés qué formato y qué tema traen clientes, no más vistas.",
    image: "/screenshots/problem-3.png",
  },
  {
    title: "Tu equipo sale de la reunión sin un plan claro",
    desc: "Después de cada reunión, el sistema propone las tareas automáticamente, las asigna por rol, les pone fecha y avisa si algo quedó trabado. Reuniones efectivas, sin revisar grabaciones.",
    image: "/screenshots/problem-4.png",
  },
  {
    title: "Comisiones, ads y plataformas, todo disperso",
    desc: "Configurás una sola vez cómo cobra cada closer, setter y miembro del equipo. El sistema suma gastos, resta comisiones y te dice la ganancia real de cada cierre de mes.",
    image: "/screenshots/problem-5.png",
  },
] as const;

const SCREENSHOT_CARD_STYLE: React.CSSProperties = {
  width: 380,
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
  overflow: "hidden",
  background: "black",
};

const TRANSITION = "transform 0.7s ease, opacity 0.7s ease";

function FloatingScreenshot({
  src,
  position,
  style,
}: {
  src: string;
  position: React.CSSProperties;
  style: React.CSSProperties;
}) {
  return (
    <div
      className="pointer-events-none absolute hidden md:block"
      style={{ ...SCREENSHOT_CARD_STYLE, ...position, ...style }}
    >
      <img src={src} alt="" aria-hidden className="block w-full" />
    </div>
  );
}

export function ProblemsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: "0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const left1Style: React.CSSProperties = {
    transform: visible ? "translateX(0)" : "translateX(-80px)",
    opacity: visible ? 1 : 0,
    transition: TRANSITION,
  };

  const left2Style: React.CSSProperties = {
    transform: visible ? "translateX(0)" : "translateX(-80px)",
    opacity: visible ? 1 : 0,
    transition: TRANSITION,
    transitionDelay: visible ? "0.12s" : "0s",
  };

  const right1Style: React.CSSProperties = {
    transform: visible ? "translateX(0)" : "translateX(80px)",
    opacity: visible ? 1 : 0,
    transition: TRANSITION,
  };

  const right2Style: React.CSSProperties = {
    transform: visible ? "translateX(0)" : "translateX(80px)",
    opacity: visible ? 1 : 0,
    transition: TRANSITION,
    transitionDelay: visible ? "0.12s" : "0s",
  };

  const problem5Style: React.CSSProperties = {
    transform: visible ? "translateY(0)" : "translateY(40px)",
    opacity: visible ? 1 : 0,
    transition: TRANSITION,
  };

  return (
    <section
      ref={sectionRef}
      className="overflow-x-hidden px-4 py-24 sm:px-6 md:py-32"
    >
      <div className="relative mx-auto max-w-6xl">
        {/* Floating screenshots — desktop only */}
        <FloatingScreenshot
          src={PROBLEMS[0].image}
          position={{ left: -80, top: 80 }}
          style={left1Style}
        />
        <FloatingScreenshot
          src={PROBLEMS[1].image}
          position={{ left: -60, top: 420 }}
          style={left2Style}
        />
        <FloatingScreenshot
          src={PROBLEMS[2].image}
          position={{ right: -80, top: 80 }}
          style={right1Style}
        />
        <FloatingScreenshot
          src={PROBLEMS[3].image}
          position={{ right: -60, top: 420 }}
          style={right2Style}
        />

        {/* Center content */}
        <div className="relative z-10 mx-auto max-w-[560px] px-4">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-950/30 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-violet-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Los problemas
          </div>

          <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
            Todo lo que hoy se te escapa
          </h2>

          <ul className="mt-12">
            {PROBLEMS.map((problem, index) => (
              <li
                key={problem.title}
                className="border-b border-white/[0.06] py-6 last:border-b-0"
              >
                <span className="font-mono text-xs text-violet-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-base font-semibold leading-snug">
                  {problem.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {problem.desc}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Problem 5 screenshot — centered, inline flow */}
        <div
          className="relative z-10 mx-auto mt-12 w-full max-w-[600px]"
          style={problem5Style}
        >
          <div style={SCREENSHOT_CARD_STYLE}>
            <img
              src={PROBLEMS[4].image}
              alt=""
              aria-hidden
              className="block w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

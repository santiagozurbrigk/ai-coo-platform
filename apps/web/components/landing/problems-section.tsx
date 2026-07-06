"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart2,
  ClipboardList,
  DollarSign,
  MessageSquareX,
  UserX,
} from "lucide-react";

const PROBLEMS: {
  icon: LucideIcon;
  title: string;
  desc: string;
  image: string;
}[] = [
  {
    icon: UserX,
    title: "Leads descalificados que igual llegan a la llamada",
    desc: "La IA cruza el chat del lead con tus estándares de agendamiento y el contexto del lead, y te avisa en el momento si esa persona no califica. Tu equipo solo habla con gente que sí puede cerrar.",
    image: "/screenshots/problem-1.png",
  },
  {
    icon: MessageSquareX,
    title: "La misma objeción se repite y tu closer la sigue perdiendo",
    desc: "La IA escucha cada llamada y arma un reporte automático de las objeciones más frecuentes, separando dudas de oferta, de contenido y de venta real. Dejás de perder la misma venta dos veces.",
    image: "/screenshots/problem-2.png",
  },
  {
    icon: BarChart2,
    title: "No sabés cuál de tus últimos 10 reels te trajo un cliente de verdad",
    desc: "Conectamos cada pieza de contenido con los leads, llamadas, cierres y dinero que generó. Sabés qué formato y qué tema traen clientes, no más vistas.",
    image: "/screenshots/problem-3.png",
  },
  {
    icon: ClipboardList,
    title: "Tu equipo sale de la reunión sin un plan claro",
    desc: "Después de cada reunión, el sistema propone las tareas automáticamente, las asigna por rol, les pone fecha y avisa si algo quedó trabado. Reuniones efectivas, sin revisar grabaciones.",
    image: "/screenshots/problem-4.png",
  },
];

const PROBLEM_FULL = {
  icon: DollarSign,
  title: "Comisiones, ads y plataformas, todo disperso",
  desc: "Configurás una sola vez cómo cobra cada closer, setter y miembro del equipo. El sistema suma gastos, resta comisiones y te dice la ganancia real de cada cierre de mes.",
  image: "/screenshots/problem-5.png",
};

function ProblemCard({
  title,
  desc,
  image,
  style,
}: {
  title: string;
  desc: string;
  image: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-6"
      style={style}
    >
      {/* TODO: reemplazar /screenshots/problem-N.png con capturas reales */}
      <img
        src={image}
        alt=""
        aria-hidden
        className="mb-4 aspect-video w-full rounded-xl object-cover"
      />
      <h3 className="text-base font-semibold leading-snug">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/50">{desc}</p>
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

  const baseTransition = "transform 0.6s ease, opacity 0.6s ease";

  const leftBase: React.CSSProperties = {
    transform: visible ? "translateX(0)" : "translateX(-60px)",
    opacity: visible ? 1 : 0,
    transition: baseTransition,
  };
  const leftStagger: React.CSSProperties = {
    ...leftBase,
    transitionDelay: visible ? "0.15s" : "0s",
  };

  const rightBase: React.CSSProperties = {
    transform: visible ? "translateX(0)" : "translateX(60px)",
    opacity: visible ? 1 : 0,
    transition: baseTransition,
  };
  const rightStagger: React.CSSProperties = {
    ...rightBase,
    transitionDelay: visible ? "0.15s" : "0s",
  };

  const bottomCard: React.CSSProperties = {
    transform: visible ? "translateY(0)" : "translateY(40px)",
    opacity: visible ? 1 : 0,
    transition: baseTransition,
    transitionDelay: visible ? "0.25s" : "0s",
  };

  return (
    <section ref={sectionRef} className="px-4 py-24 sm:px-6 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-violet-950/30 px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-violet-400">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
          Los problemas
        </div>

        <h2 className="text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
          Todo lo que hoy se te escapa
        </h2>

        {/* 3-column layout: left (2 cards) | center gap | right (2 cards) */}
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-[1fr_2rem_1fr]">
          {/* Left column */}
          <div className="flex flex-col gap-4">
            <ProblemCard
              title={PROBLEMS[0].title}
              desc={PROBLEMS[0].desc}
              image={PROBLEMS[0].image}
              style={leftBase}
            />
            <ProblemCard
              title={PROBLEMS[1].title}
              desc={PROBLEMS[1].desc}
              image={PROBLEMS[1].image}
              style={leftStagger}
            />
          </div>

          {/* Center decorative gap — hidden on mobile */}
          <div className="hidden md:block" />

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <ProblemCard
              title={PROBLEMS[2].title}
              desc={PROBLEMS[2].desc}
              image={PROBLEMS[2].image}
              style={rightBase}
            />
            <ProblemCard
              title={PROBLEMS[3].title}
              desc={PROBLEMS[3].desc}
              image={PROBLEMS[3].image}
              style={rightStagger}
            />
          </div>
        </div>

        {/* 5th card — centered below */}
        <div className="mt-4 flex justify-center">
          <div className="w-full md:w-1/2">
            <ProblemCard
              title={PROBLEM_FULL.title}
              desc={PROBLEM_FULL.desc}
              image={PROBLEM_FULL.image}
              style={bottomCard}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

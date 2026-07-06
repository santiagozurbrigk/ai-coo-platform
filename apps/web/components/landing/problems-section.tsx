"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const FEATURES = [
  {
    label: "LEADS Y CALIFICACIÓN",
    title: "Leads descalificados que igual llegan a la llamada",
    desc: "La IA cruza el chat del lead con tus estándares de agendamiento y el contexto del lead, y te avisa en el momento si esa persona no califica. Tu equipo solo habla con gente que sí puede cerrar.",
    bullets: [
      "Cruce automático del chat con tus estándares",
      "Alerta en tiempo real si el lead no califica",
      "Tu equipo solo habla con gente que puede cerrar",
    ],
    image: "/screenshots/problem-1.png",
    imageFirst: false,
  },
  {
    label: "OBJECIONES Y VENTAS",
    title: "La misma objeción se repite y tu closer la sigue perdiendo",
    desc: "La IA escucha cada llamada y arma un reporte automático de las objeciones más frecuentes, separando dudas de oferta, de contenido y de venta real. Dejás de perder la misma venta dos veces.",
    bullets: [
      "Análisis automático de cada llamada",
      "Reporte de objeciones más frecuentes",
      "Separadas por tipo: oferta, contenido, venta real",
    ],
    image: "/screenshots/problem-2.png",
    imageFirst: true,
  },
  {
    label: "MARKETING Y ATRIBUCIÓN",
    title: "No sabés cuál de tus últimos 10 reels te trajo un cliente de verdad",
    desc: "Conectamos cada pieza de contenido con los leads, llamadas, cierres y dinero que generó. Sabés qué formato y qué tema traen clientes, no más vistas.",
    bullets: [
      "Cada pieza de contenido conectada a leads y cierres",
      "Sabés qué formato trae clientes, no vistas",
      "Atribución real de revenue a contenido",
    ],
    image: "/screenshots/problem-3.png",
    imageFirst: false,
  },
  {
    label: "EQUIPO Y OPERACIONES",
    title: "Tu equipo sale de la reunión sin un plan claro",
    desc: "Después de cada reunión, el sistema propone las tareas automáticamente, las asigna por rol, les pone fecha y avisa si algo quedó trabado. Reuniones efectivas, sin revisar grabaciones.",
    bullets: [
      "Tareas propuestas automáticamente post-reunión",
      "Asignación por rol con fecha",
      "Alerta si algo quedó trabado",
    ],
    image: "/screenshots/problem-4.png",
    imageFirst: true,
  },
  {
    label: "FINANZAS Y COMISIONES",
    title: "Comisiones, ads y plataformas, todo disperso",
    desc: "Configurás una sola vez cómo cobra cada closer, setter y miembro del equipo. El sistema suma gastos, resta comisiones y te dice la ganancia real de cada cierre de mes.",
    bullets: [
      "Configurás una vez cómo cobra cada miembro",
      "El sistema calcula ganancia real por cierre",
      "Gastos, comisiones y revenue en un solo lugar",
    ],
    image: "/screenshots/problem-5.png",
    imageFirst: false,
  },
] as const;

const TRANSITION = "transform 0.7s ease, opacity 0.7s ease";

const SCREENSHOT_STYLE =
  "overflow-hidden rounded-2xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.6)]";

function FeatureBlock({
  label,
  title,
  desc,
  bullets,
  image,
  imageFirst,
}: (typeof FEATURES)[number]) {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.15, rootMargin: "0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const imageFromLeft = imageFirst;
  const imageHiddenTransform = imageFromLeft
    ? "translateX(-60px)"
    : "translateX(60px)";
  const textHiddenTransform = imageFromLeft
    ? "translateX(60px)"
    : "translateX(-60px)";

  const imageStyle: React.CSSProperties = {
    transform: visible ? "translateX(0)" : imageHiddenTransform,
    opacity: visible ? 1 : 0,
    transition: TRANSITION,
  };

  const textStyle: React.CSSProperties = {
    transform: visible ? "translateX(0)" : textHiddenTransform,
    opacity: visible ? 1 : 0,
    transition: TRANSITION,
    transitionDelay: visible ? "0.1s" : "0s",
  };

  const imageBlock = (
    <div className={SCREENSHOT_STYLE} style={imageStyle}>
      <Image
        src={image}
        alt=""
        width={960}
        height={540}
        className="h-auto w-full object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        aria-hidden
      />
    </div>
  );

  const textBlock = (
    <div style={textStyle}>
      <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
        {label}
      </div>
      <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
        {title}
      </h2>
      <p className="mt-4 text-base font-normal leading-relaxed text-white/60 md:text-lg">
        {desc}
      </p>
      <ul className="mt-6 space-y-3">
        {bullets.map((bullet) => (
          <li
            key={bullet}
            className="flex items-start gap-3 text-sm leading-relaxed text-white/60 md:text-base"
          >
            <span className="mt-0.5 text-violet-400">✓</span>
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2">
        {imageFirst ? (
          <>
            <div className="order-1">{imageBlock}</div>
            <div className="order-2">{textBlock}</div>
          </>
        ) : (
          <>
            <div className="order-2 md:order-1">{textBlock}</div>
            <div className="order-1 md:order-2">{imageBlock}</div>
          </>
        )}
      </div>
    </section>
  );
}

export function ProblemsSection() {
  return (
    <>
      <section className="px-4 py-28 sm:px-6 md:py-40">
        <div className="mx-auto mb-24 max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
            LOS PROBLEMAS
          </div>
          <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
            Todo lo que hoy se te escapa
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base font-normal leading-relaxed text-white/60 md:text-lg">
            Cada área de tu negocio corriendo por separado. OTC las conecta.
          </p>
        </div>
      </section>

      {FEATURES.map((feature) => (
        <FeatureBlock key={feature.title} {...feature} />
      ))}
    </>
  );
}

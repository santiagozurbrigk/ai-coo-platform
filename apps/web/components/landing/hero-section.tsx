"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { paths } from "@/routes";

const FLOATING_SCREENSHOTS = [
  {
    src: "/screenshots/problem-1.png",
    position: { left: -200, top: "10%" },
    fromRight: false,
    stagger: false,
    rotate: "-6deg",
  },
  {
    src: "/screenshots/problem-2.png",
    position: { left: -180, top: "55%" },
    fromRight: false,
    stagger: true,
    rotate: "4deg",
  },
  {
    src: "/screenshots/problem-3.png",
    position: { right: -200, top: "10%" },
    fromRight: true,
    stagger: false,
    rotate: "6deg",
  },
  {
    src: "/screenshots/problem-4.png",
    position: { right: -180, top: "55%" },
    fromRight: true,
    stagger: true,
    rotate: "-4deg",
  },
] as const;

const SCREENSHOT_CARD_STYLE: React.CSSProperties = {
  position: "absolute",
  width: 420,
  borderRadius: 16,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
};

const TRUST_ITEMS = [
  "Sin tarjeta de crédito",
  "3 días de acceso completo",
  "Onboarding 1:1 incluido",
];

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-0 items-center overflow-hidden px-4 py-16 sm:px-6 sm:py-28 md:min-h-screen md:py-40"
    >
      {/* Floating screenshots */}
      {FLOATING_SCREENSHOTS.map(({ src, position, fromRight, stagger, rotate }) => (
        <div
          key={src}
          className="pointer-events-none absolute hidden md:block"
          style={{
            ...SCREENSHOT_CARD_STYLE,
            ...position,
            transform: visible
              ? `translateX(0px) rotate(${rotate})`
              : `translateX(${fromRight ? "80px" : "-80px"}) rotate(${rotate})`,
            opacity: visible ? 1 : 0,
            transition: "transform 0.8s ease, opacity 0.8s ease",
            transitionDelay: visible && stagger ? "0.15s" : "0s",
          }}
        >
          <Image
            src={src}
            alt=""
            width={840}
            height={472}
            className="h-auto w-full object-cover"
            sizes="420px"
            aria-hidden
          />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-2 text-center sm:px-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
          Prueba gratuita · 3 días · Sin tarjeta
        </div>

        <h1 className="mt-6 text-4xl font-black leading-[0.95] tracking-[-0.04em] sm:mt-8 sm:text-5xl md:text-6xl lg:text-8xl lg:leading-[0.9]">
          El sistema operativo
          <br />
          para tu{" "}
          <em className="whitespace-nowrap text-[#7C3AED] italic">
            infoproducto
          </em>
        </h1>

        <p className="mx-auto mt-5 max-w-xl px-1 text-base font-normal leading-relaxed text-white/60 sm:mt-6 md:text-lg">
          Ventas, clientes, marketing, finanzas y operaciones en un solo lugar.
          Probalo 3 días gratis con onboarding personalizado incluido.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center">
          <a
            href="#agendar"
            className="inline-block w-full max-w-xs rounded-full bg-[#7C3AED] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#6D28D9] sm:w-auto"
          >
            Empezá gratis ahora
          </a>
          <Link
            href={paths.platform.dashboard}
            className="text-sm text-white/50 transition-colors hover:text-white/80"
          >
            Ya tengo cuenta →
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {TRUST_ITEMS.map((item) => (
            <span
              key={item}
              className="flex items-center gap-1.5 text-xs text-white/40"
            >
              <span className="h-1 w-1 rounded-full bg-violet-400" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

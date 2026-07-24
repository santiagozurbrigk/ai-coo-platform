"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { paths } from "@/routes";
import { VslPlayer } from "./vsl-player";

const FLOATING_SCREENSHOTS = [
  {
    src: "/screenshots/problem-1.png",
    side: "left" as const,
    top: "12%",
    stagger: false,
  },
  {
    src: "/screenshots/problem-2.png",
    side: "left" as const,
    top: "54%",
    stagger: true,
  },
  {
    src: "/screenshots/problem-3.png",
    side: "right" as const,
    top: "12%",
    stagger: false,
  },
  {
    src: "/screenshots/problem-4.png",
    side: "right" as const,
    top: "54%",
    stagger: true,
  },
] as const;

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
      className="relative flex min-h-0 items-center overflow-hidden px-4 py-20 sm:px-6 sm:py-32 md:min-h-screen md:py-44"
    >
      {/* Floating side cards */}
      {FLOATING_SCREENSHOTS.map(({ src, side, top, stagger }) => {
        const isLeft = side === "left";

        const positionStyle: React.CSSProperties = isLeft
          ? { left: -155, top }
          : { right: -155, top };

        // Gradient mask: fades toward center (inner edge transparent, outer edge opaque)
        const maskGradient = isLeft
          ? "linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 55%, transparent 100%)"
          : "linear-gradient(to left, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 55%, transparent 100%)";

        const hiddenTranslate = isLeft ? "-28px" : "28px";

        return (
          <div
            key={src}
            className="pointer-events-none absolute hidden w-[360px] overflow-hidden rounded-2xl border border-white/[0.07] shadow-[0_24px_60px_rgba(0,0,0,0.7)] md:block"
            style={{
              ...positionStyle,
              WebkitMaskImage: maskGradient,
              maskImage: maskGradient,
              transform: visible
                ? "translateX(0px)"
                : `translateX(${hiddenTranslate})`,
              opacity: visible ? 0.75 : 0,
              transition: "transform 1s ease, opacity 1s ease",
              transitionDelay: stagger ? "0.2s" : "0s",
            }}
          >
            <Image
              src={src}
              alt=""
              width={720}
              height={405}
              className="h-auto w-full object-cover"
              sizes="360px"
              aria-hidden
            />
          </div>
        );
      })}

      {/* Main content */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-2 text-center sm:px-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]">
          <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
          Prueba gratuita · 3 días · Sin tarjeta
        </div>

        {/* Headline */}
        <h1 className="mt-7 text-5xl font-black leading-[0.93] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-[88px]">
          El sistema operativo
          <br />
          para tu{" "}
          <em className="whitespace-nowrap text-[#7C3AED] not-italic">
            infoproducto
          </em>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-lg text-base font-normal leading-relaxed text-white/55 md:text-lg">
          Ventas, clientes, marketing, finanzas y operaciones en un solo lugar.
          Probalo 3 días gratis con onboarding personalizado incluido.
        </p>

        {/* CTA */}
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a
            href="#agendar"
            className="inline-block w-full max-w-[240px] rounded-full bg-[#7C3AED] px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.35)] transition-colors hover:bg-[#6D28D9] sm:w-auto"
          >
            Empezá gratis ahora
          </a>
          <Link
            href={paths.platform.dashboard}
            className="text-sm text-white/40 transition-colors hover:text-white/70"
          >
            Ya tengo cuenta →
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-5 flex items-center justify-center gap-2 text-sm text-white/45">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]" />
          Más founders conectan OTC cada semana
        </p>

        {/* VSL */}
        <div className="mx-auto mt-16 w-full max-w-3xl">
          <VslPlayer />
        </div>
      </div>
    </section>
  );
}

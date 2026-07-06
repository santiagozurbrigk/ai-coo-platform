"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { VslPlayer } from "./vsl-player";
import { WaitlistForm } from "./waitlist-form";

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

const TRANSITION = "transform 0.8s ease, opacity 0.8s ease";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.05, rootMargin: "0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="flex items-center px-4 py-28 sm:px-6 md:py-40"
      style={{ position: "relative", overflow: "hidden", minHeight: "100vh" }}
    >
      {FLOATING_SCREENSHOTS.map(({ src, position, fromRight, stagger, rotate }) => {
        const hiddenTranslate = fromRight ? "80px" : "-80px";

        return (
          <div
            key={src}
            className="pointer-events-none absolute hidden md:block"
            style={{
              ...SCREENSHOT_CARD_STYLE,
              ...position,
              transform: visible
                ? `translateX(0px) rotate(${rotate})`
                : `translateX(${hiddenTranslate}) rotate(${rotate})`,
              opacity: visible ? 1 : 0,
              transition: TRANSITION,
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
        );
      })}

      <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Lanzamiento 13/07
          </div>

          <h1 className="mt-8 text-6xl font-black leading-[0.9] tracking-[-0.04em] md:text-8xl">
            El segundo cerebro para
            <br />
            <em className="text-[#7C3AED] italic">infoproductores</em>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base font-normal leading-relaxed text-white/60 md:text-lg">
            Conectá ventas, marketing, finanzas, producto y clientes en un solo
            lugar. Y escalá sin perder el control.
          </p>

          <a
            href="#waitlist"
            className="mt-10 inline-block rounded-full bg-[#7C3AED] px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-[#6D28D9]"
          >
            Quiero mi lugar
          </a>

          <p className="mt-4 text-sm text-white/40">
            Solo 10 cupos · Completá el formulario para aplicar
          </p>

          <div className="mx-auto mt-16 w-full max-w-3xl">
            <VslPlayer />
          </div>

        <div id="waitlist" className="mx-auto mt-10 max-w-md scroll-mt-24">
          <WaitlistForm className="justify-center" />
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import { paths } from "@/routes";
import { HeroSection } from "./hero-section";

import { ProblemsSection } from "./problems-section";
import { HowItWorksSection } from "./how-it-works-section";
import { WhatsIncludedSection } from "./whats-included-section";
import { TrialBookingSection } from "./trial-booking-section";
import { IntegrationsSection } from "./integrations-section";
import { FaqSection } from "./faq-section";
import { FinalCtaSection } from "./final-cta-section";
import { brand } from "@/lib/brand";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemsSection />
      <HowItWorksSection />
      <WhatsIncludedSection />
      <TrialBookingSection />
      <IntegrationsSection />
      <FaqSection />
      <FinalCtaSection />

      <footer className="border-t border-white/[0.05] px-4 py-16 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-black text-white">{brand.wordmark}</p>
            <p className="mt-2 max-w-xs text-sm text-white/50">
              El sistema operativo para infoproductores
            </p>
            <p className="mt-6 text-xs text-white/40">
              © 2026 {brand.legalName} · {brand.domain}
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm">
            <Link
              href={paths.platform.dashboard}
              className="text-white/70 transition-colors hover:text-white"
            >
              Iniciar sesión
            </Link>
            <a
              href="#agendar"
              className="text-white/70 transition-colors hover:text-white"
            >
              Prueba gratis
            </a>
            <Link
              href="/privacidad"
              className="text-white/70 transition-colors hover:text-white"
            >
              Privacidad
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

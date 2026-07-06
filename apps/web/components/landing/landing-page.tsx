import Link from "next/link";
import { paths } from "@/routes";
import { HeroSection } from "./hero-section";
import { ProblemsSection } from "./problems-section";
import { HowItWorksSection } from "./how-it-works-section";
import { IntegrationsSection } from "./integrations-section";
import { FaqSection } from "./faq-section";
import { FinalCtaSection } from "./final-cta-section";

export function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemsSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <FaqSection />
      <FinalCtaSection />

      <footer className="border-t border-white/[0.05] px-4 py-16 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-black text-white">OTC</p>
            <p className="mt-2 max-w-xs text-sm text-white/50">
              El segundo cerebro para infoproductores
            </p>
            <p className="mt-6 text-xs text-white/40">
              © 2026 Optimiza Tu Control · optimizatucontrol.com
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
              href="#waitlist"
              className="text-white/70 transition-colors hover:text-white"
            >
              Aplicar a un cupo
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

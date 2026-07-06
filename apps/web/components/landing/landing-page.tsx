import Link from "next/link";
import { paths } from "@/routes";
import { HeroSection } from "./hero-section";
import { ProblemsSection } from "./problems-section";
import { HowItWorksSection } from "./how-it-works-section";
import { IntegrationsSection } from "./integrations-section";
import { FinalCtaSection } from "./final-cta-section";

export function LandingPage() {
  return (
    <>
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href={paths.platform.dashboard}
            className="text-base font-semibold tracking-tight text-white hover:text-white/80 transition-colors"
          >
            OTC
          </Link>
          <a
            href="#waitlist"
            className="rounded-full bg-[#7C3AED] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6D28D9]"
          >
            Quiero mi lugar
          </a>
        </div>
      </header>

      {/* ── Sections ── */}
      <HeroSection />
      <ProblemsSection />
      <HowItWorksSection />
      <IntegrationsSection />
      <FinalCtaSection />

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-white/40">
        © 2026 Optimiza Tu Control · optimizatucontrol.com
      </footer>
    </>
  );
}

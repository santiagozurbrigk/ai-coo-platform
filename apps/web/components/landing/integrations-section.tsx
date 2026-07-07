import { cn } from "@ai-coo/ui";
import { INTEGRATION_BRAND_COLORS } from "@/lib/integrations/brand-colors";
import type { IntegrationProvider } from "@/constants/integrations";

const INTEGRATIONS: { name: string; slug: IntegrationProvider }[] = [
  { name: "Calendly", slug: "calendly" },
  { name: "Instagram", slug: "instagram" },
  { name: "Fathom", slug: "fathom" },
  { name: "Discord", slug: "discord" },
  { name: "ManyChat", slug: "manychat" },
  { name: "Typeform", slug: "typeform" },
  { name: "YouTube", slug: "youtube" },
  { name: "Google Docs", slug: "google_docs" },
  { name: "Google Sheets", slug: "google_sheets" },
];

function IntegrationLogo({
  slug,
  className,
}: {
  slug: IntegrationProvider;
  className?: string;
}) {
  const { hex } = INTEGRATION_BRAND_COLORS[slug];
  const logoSrc = `/integrations/${slug}.svg`;

  return (
    <span
      aria-hidden
      className={cn("inline-block h-7 w-7 shrink-0", className)}
      style={{
        backgroundColor: hex,
        WebkitMaskImage: `url(${logoSrc})`,
        maskImage: `url(${logoSrc})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export function IntegrationsSection() {
  return (
    <section className="border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-violet-400">
            INTEGRACIONES
          </div>
          <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
            OTC funciona donde ya trabajás
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-white/60 md:text-lg">
            Conectamos las herramientas que ya usás para que tu negocio hable en
            un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {INTEGRATIONS.map(({ name, slug }) => {
            const { bgClass } = INTEGRATION_BRAND_COLORS[slug];

            return (
              <div
                key={slug}
                className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center"
              >
                <div
                  className={cn(
                    "mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl",
                    bgClass
                  )}
                >
                  <IntegrationLogo slug={slug} />
                </div>
                <p className="text-sm font-semibold text-white">{name}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-violet-500/20 bg-violet-950/40 p-8 text-center">
          <p className="text-base font-medium text-violet-100 md:text-lg">
            ¿Tu herramienta no está? La conectamos en el onboarding.
          </p>
          <a
            href="#waitlist"
            className="mt-6 inline-block rounded-full bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9]"
          >
            Quiero mi lugar
          </a>
        </div>
      </div>
    </section>
  );
}

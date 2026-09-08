import { cn } from "@ai-coo/ui";
import { IntegrationLogo } from "@/components/integrations/integration-logo";
import type { IntegrationProvider } from "@/constants/integrations";
import { brand } from "@/lib/brand";

const MAIN_INTEGRATIONS: { name: string; slug: IntegrationProvider }[] = [
  { name: "Calendly", slug: "calendly" },
  { name: "Instagram", slug: "instagram" },
  { name: "Fathom", slug: "fathom" },
  { name: "Discord", slug: "discord" },
  { name: "ManyChat", slug: "manychat" },
  { name: "Typeform", slug: "typeform" },
  { name: "YouTube", slug: "youtube" },
  { name: "Zernio", slug: "zernio" },
];

const CENTERED_INTEGRATIONS: { name: string; slug: IntegrationProvider }[] = [
  { name: "WhatsApp", slug: "unipile_whatsapp" },
  { name: "Google Forms", slug: "google_forms" },
  { name: "GoHighLevel", slug: "ghl" },
];

function IntegrationCard({
  name,
  slug,
  className,
}: {
  name: string;
  slug: IntegrationProvider;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 text-center",
        className,
      )}
    >
      {/*
        El mismo logo que la pantalla de Integraciones. Antes la landing repetía
        la lógica de máscara por su cuenta, así que un proveedor cuyo asset no
        fuera un glifo monocromo se rompía sólo acá.
      */}
      <IntegrationLogo provider={slug} size="md" className="mx-auto mb-3" />
      <p className="text-sm font-semibold text-white">{name}</p>
    </div>
  );
}

export function IntegrationsSection() {
  return (
    <section className="border-t border-white/[0.04] px-4 py-28 sm:px-6 md:py-40">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-950/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-400">
            INTEGRACIONES
          </div>
          <h2 className="mt-6 text-4xl font-black leading-[1] tracking-[-0.03em] md:text-6xl">
            {brand.name} funciona donde ya trabajás
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-normal leading-relaxed text-white/60 md:text-lg">
            Conectamos las herramientas que ya usás para que tu negocio hable en
            un solo lugar.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {MAIN_INTEGRATIONS.map((integration) => (
            <IntegrationCard key={integration.slug} {...integration} />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {CENTERED_INTEGRATIONS.map((integration) => (
            <IntegrationCard
              key={integration.slug}
              {...integration}
              className="w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)]"
            />
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-brand-500/20 bg-brand-950/40 p-8 text-center">
          <p className="text-base font-medium text-brand-100 md:text-lg">
            ¿Tu herramienta no está? La conectamos en el onboarding.
          </p>
          <a
            href="#waitlist"
            className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Quiero mi lugar
          </a>
        </div>
      </div>
    </section>
  );
}

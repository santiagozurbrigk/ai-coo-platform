import { cn } from "@ai-coo/ui";
import type { IntegrationProvider } from "@/constants/integrations";
import {
  hasIntegrationLogo,
  INTEGRATION_BRAND_COLORS,
  integrationLogoSrc,
} from "@/lib/integrations/brand-colors";
import { getIntegrationDefinition } from "@/lib/integrations/registry";

const SIZE = {
  xs: { box: "h-6 w-6 rounded-md", icon: "h-3.5 w-3.5", text: "text-[10px]" },
  sm: { box: "h-9 w-9 rounded-xl", icon: "h-5 w-5", text: "text-xs" },
  md: { box: "h-11 w-11 rounded-xl", icon: "h-6 w-6", text: "text-sm" },
  lg: { box: "h-14 w-14 rounded-2xl", icon: "h-7 w-7", text: "text-base" },
} as const;

/**
 * Logo de una integración.
 *
 * Los proveedores sin SVG en `public/integrations/` se dibujan con su inicial
 * sobre el color de marca, en vez de dejar una máscara vacía —que es lo que
 * pasaba antes: el `mask-image` apuntaba a un archivo inexistente y el cuadro
 * salía liso, sin ninguna señal de que faltaba el asset.
 */
export function IntegrationLogo({
  provider,
  className,
  size = "md",
}: {
  provider: IntegrationProvider;
  className?: string;
  size?: keyof typeof SIZE;
}) {
  const brand = INTEGRATION_BRAND_COLORS[provider];
  const { box, icon, text } = SIZE[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center shadow-sm",
        box,
        brand.bgClass ?? "",
        className,
      )}
      style={!brand.bgClass ? { backgroundColor: brand.bg } : undefined}
      aria-hidden
    >
      {hasIntegrationLogo(provider) ? (
        <span
          className={cn("inline-block", icon)}
          style={{
            backgroundColor: "#ffffff",
            WebkitMaskImage: `url(${integrationLogoSrc(provider)})`,
            maskImage: `url(${integrationLogoSrc(provider)})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        />
      ) : (
        <span className={cn("font-semibold tracking-tight text-white", text)}>
          {getIntegrationDefinition(provider).name.charAt(0)}
        </span>
      )}
    </div>
  );
}

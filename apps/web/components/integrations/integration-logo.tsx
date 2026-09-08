import { cn } from "@ai-coo/ui";
import type { IntegrationProvider } from "@/constants/integrations";
import {
  INTEGRATION_BRAND_COLORS,
  integrationLogoAsset,
} from "@/lib/integrations/brand-colors";
import { getIntegrationDefinition } from "@/lib/integrations/registry";

const SIZE = {
  xs: { box: "h-6 w-6 rounded-md", glyph: "h-3.5 w-3.5", text: "text-[10px]" },
  sm: { box: "h-9 w-9 rounded-xl", glyph: "h-5 w-5", text: "text-xs" },
  md: { box: "h-11 w-11 rounded-xl", glyph: "h-6 w-6", text: "text-sm" },
  lg: { box: "h-14 w-14 rounded-2xl", glyph: "h-7 w-7", text: "text-base" },
} as const;

/**
 * Logo de una integración.
 *
 * Dos formas de dibujarlo según el asset que publica cada marca (ver
 * `brand-colors.ts`): un glifo monocromo enmascarado sobre el color de marca, o
 * el app icon tal cual, que trae su propio fondo. Los que no tienen ninguno se
 * dibujan con su inicial.
 *
 * Antes había una sola forma —siempre máscara— y los proveedores sin SVG
 * apuntaban a un archivo inexistente: el `mask-image` no cargaba y el cuadro
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
  const asset = integrationLogoAsset(provider);
  const { box, glyph, text } = SIZE[size];

  // El app icon ocupa todo el cuadro: su fondo es el del propio logo.
  if (asset.kind === "icon") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden bg-white/5 shadow-sm ring-1 ring-inset ring-black/10 dark:ring-white/10",
          box,
          className,
        )}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={asset.src}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </span>
    );
  }

  const brand = INTEGRATION_BRAND_COLORS[provider];

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center shadow-sm",
        box,
        brand.bgClass ?? "",
        className,
      )}
      style={!brand.bgClass ? { backgroundColor: brand.bg } : undefined}
      aria-hidden
    >
      {asset.kind === "mask" ? (
        <span
          className={cn("inline-block", glyph)}
          style={{
            backgroundColor: "#ffffff",
            WebkitMaskImage: `url(${asset.src})`,
            maskImage: `url(${asset.src})`,
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
    </span>
  );
}

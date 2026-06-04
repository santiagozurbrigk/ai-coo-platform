import { cn } from "@ai-coo/ui";
import type { IntegrationProvider } from "@/constants/integrations";
import {
  INTEGRATION_BRAND_COLORS,
  integrationLogoSrc,
} from "@/lib/integrations/brand-colors";

export function IntegrationLogo({
  provider,
  className,
  size = "md",
}: {
  provider: IntegrationProvider;
  className?: string;
  size?: "md" | "sm";
}) {
  const brand = INTEGRATION_BRAND_COLORS[provider];
  const src = integrationLogoSrc(provider);
  const box = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const icon = size === "sm" ? "h-5 w-5" : "h-6 w-6";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl border border-border/50",
        box,
        brand.bgClass,
        className
      )}
      aria-hidden
    >
      <span
        className={cn(
          "inline-block",
          icon,
          (provider === "notion" || provider === "typeform") && "dark:!bg-white"
        )}
        style={{
          backgroundColor: brand.hex,
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
      />
    </div>
  );
}

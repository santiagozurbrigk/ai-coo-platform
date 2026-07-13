import { cn } from "@ai-coo/ui";
import type { IntegrationProvider } from "@/constants/integrations";
import {
  INTEGRATION_BRAND_COLORS,
  integrationLogoSrc,
} from "@/lib/integrations/brand-colors";

const SIZE = {
  xs: { box: "h-7 w-7 rounded-lg", icon: "h-4 w-4" },
  sm: { box: "h-9 w-9 rounded-xl", icon: "h-5 w-5" },
  md: { box: "h-11 w-11 rounded-xl", icon: "h-6 w-6" },
} as const;

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
  const src = integrationLogoSrc(provider);
  const { box, icon } = SIZE[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center shadow-sm",
        box,
        brand.bgClass ?? "",
        className
      )}
      style={!brand.bgClass ? { backgroundColor: brand.bg } : undefined}
      aria-hidden
    >
      <span
        className={cn("inline-block", icon)}
        style={{
          backgroundColor: "#ffffff",
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

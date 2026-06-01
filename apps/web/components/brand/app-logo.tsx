import type { CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@ai-coo/ui";
import { brandAssets } from "@/lib/brand";
import { paths } from "@/routes";

type AppLogoDisplay = "default" | "sidebar" | "hero" | "compact" | "login";

type AppLogoProps = {
  variant?: "full" | "icon";
  display?: AppLogoDisplay;
  href?: string;
  className?: string;
  /** Solo para display default/compact — altura en px */
  height?: number;
};

const displayStyles: Record<
  AppLogoDisplay,
  { img: string; link: string; style?: CSSProperties }
> = {
  sidebar: {
    link: "flex w-full justify-center",
    img: "h-auto w-full max-w-[212px] object-contain object-center",
    style: { maxHeight: 72 },
  },
  hero: {
    link: "flex w-full justify-center",
    img: "h-auto w-full max-w-[min(320px,90vw)] object-contain object-center",
    style: { maxHeight: 96 },
  },
  compact: {
    link: "inline-flex items-center",
    img: "h-8 w-auto max-w-[200px] object-contain object-left",
  },
  login: {
    link: "flex w-full justify-center",
    img: "h-24 w-auto max-w-[600px] object-contain object-center",
  },
  default: {
    link: "inline-flex items-center",
    img: "w-auto object-contain object-left",
  },
};

export function AppLogo({
  variant = "full",
  display = "default",
  href = paths.platform.dashboard,
  className,
  height = variant === "icon" ? 28 : 32,
}: AppLogoProps) {
  const src = variant === "icon" ? brandAssets.logoIcon : brandAssets.logo;
  const preset = displayStyles[display];
  const useFixedHeight = display === "default" || display === "compact";

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="AI COO"
      className={cn(preset.img, className)}
      style={
        useFixedHeight
          ? {
              height,
              width: "auto",
              maxWidth: display === "compact" ? 200 : 180,
            }
          : preset.style
      }
    />
  );

  if (!href) {
    return <span className={cn(preset.link, className)}>{image}</span>;
  }

  return (
    <Link
      href={href}
      className={cn(
        preset.link,
        "transition-opacity hover:opacity-90",
        className
      )}
    >
      {image}
    </Link>
  );
}

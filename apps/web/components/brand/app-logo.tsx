"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@ai-coo/ui";
import { brandAssets, getThemeIsotipoSrc } from "@/lib/brand";
import { useTheme } from "@/providers/theme-provider";
import { paths } from "@/routes";

type AppLogoDisplay =
  | "default"
  | "sidebar"
  | "sidebarCollapsed"
  | "hero"
  | "compact"
  | "login";

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
    img: "h-auto w-full max-w-[140px] object-contain object-center",
    style: { maxHeight: 48 },
  },
  sidebarCollapsed: {
    link: "mx-auto flex h-9 w-9 items-center justify-center",
    img: "h-8 w-8 object-contain object-center",
  },
  hero: {
    link: "flex w-full justify-center",
    img: "h-auto w-full max-w-[min(320px,90vw)] object-contain object-center",
    style: { maxHeight: 96 },
  },
  compact: {
    link: "inline-flex items-center",
    img: "h-8 w-8 object-contain object-center",
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

function resolveLogoSrc(
  variant: "full" | "icon",
  display: AppLogoDisplay,
  theme: "light" | "dark"
): string {
  const useIsotipo =
    variant === "icon" ||
    display === "sidebar" ||
    display === "sidebarCollapsed" ||
    display === "compact";

  if (useIsotipo) {
    return getThemeIsotipoSrc(theme);
  }

  return brandAssets.logo;
}

export function AppLogo({
  variant = "full",
  display = "default",
  href = paths.platform.dashboard,
  className,
  height = variant === "icon" ? 28 : 32,
}: AppLogoProps) {
  const { theme } = useTheme();
  const src = resolveLogoSrc(variant, display, theme);
  const preset = displayStyles[display];
  const useFixedHeight =
    display === "default" ||
    (display === "compact" && variant === "full");

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="OTC"
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

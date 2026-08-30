import type { CSSProperties } from "react";
import Link from "next/link";
import { cn } from "@ai-coo/ui";
import { brand, brandAssets } from "@/lib/brand";
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
    img: "h-auto w-full max-w-[180px] object-contain object-center",
    style: { maxHeight: 40 },
  },
  hero: {
    link: "flex w-full justify-center",
    img: "h-auto w-full max-w-[min(320px,90vw)] object-contain object-center",
    style: { maxHeight: 48 },
  },
  compact: {
    link: "inline-flex items-center",
    img: "h-8 w-auto max-w-[200px] object-contain object-left",
  },
  login: {
    /* El lockup es muy apaisado (≈8.4:1): se limita por ancho para que no
       desborde la tarjeta de login. */
    link: "flex w-full justify-center",
    img: "h-auto w-full max-w-[260px] object-contain object-center",
  },
  default: {
    link: "inline-flex items-center",
    img: "w-auto object-contain object-left",
  },
};

/**
 * El manual de marca presenta el logotipo en monocromo: negro sobre fondos
 * claros, blanco sobre oscuros. Se renderizan las dos versiones y el tema
 * decide cuál se ve — el script de `layout.tsx` fija la clase `.dark` antes
 * del primer paint, así que no hay parpadeo.
 */
export function AppLogo({
  variant = "full",
  display = "default",
  href = paths.platform.dashboard,
  className,
  height = variant === "icon" ? 28 : 32,
}: AppLogoProps) {
  const [lightSrc, darkSrc] =
    variant === "icon"
      ? [brandAssets.logoIconLight, brandAssets.logoIconDark]
      : [brandAssets.logoLight, brandAssets.logoDark];

  const preset = displayStyles[display];
  const useFixedHeight = display === "default" || display === "compact";
  const style: CSSProperties | undefined = useFixedHeight
    ? {
        height,
        width: "auto",
        maxWidth: display === "compact" ? 200 : 180,
      }
    : preset.style;

  const image = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- logo estático en /public */}
      <img
        src={lightSrc}
        alt={brand.name}
        className={cn(preset.img, "dark:hidden", className)}
        style={style}
      />
      {/* eslint-disable-next-line @next/next/no-img-element -- logo estático en /public */}
      <img
        src={darkSrc}
        alt=""
        aria-hidden
        className={cn(preset.img, "hidden dark:block", className)}
        style={style}
      />
    </>
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

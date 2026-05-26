"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { pushHashTab } from "@/lib/hooks/use-hash-tab";

type HashTabLinkProps = ComponentProps<typeof Link>;

function hrefToString(href: HashTabLinkProps["href"]): string {
  if (typeof href === "string") return href;
  if (href && typeof href === "object") {
    const path = "pathname" in href && href.pathname ? href.pathname : "";
    const hash = "hash" in href && href.hash ? href.hash : "";
    return `${path}${hash}`;
  }
  return "";
}

/** Enlace a `#tab` en la misma ruta: actualiza la pestaña sin recargar (App Router). */
export function HashTabLink({ href, onClick, scroll = false, ...rest }: HashTabLinkProps) {
  const hrefStr = hrefToString(href);

  return (
    <Link
      href={href}
      scroll={scroll}
      onClick={(e) => {
        if (hrefStr && pushHashTab(hrefStr)) {
          e.preventDefault();
        }
        onClick?.(e);
      }}
      {...rest}
    />
  );
}

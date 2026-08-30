"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getPageMeta } from "@/lib/navigation/page-meta";
import { brand } from "@/lib/brand";

/** Sincroniza document.title con <marca> | módulo actual. */
export function PlatformDocumentTitle() {
  const pathname = usePathname();

  useEffect(() => {
    const { title } = getPageMeta(pathname);
    document.title = `${brand.name} | ${title}`;
  }, [pathname]);

  return null;
}

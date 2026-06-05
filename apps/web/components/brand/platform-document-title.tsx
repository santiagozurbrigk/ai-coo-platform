"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getPageMeta } from "@/lib/navigation/page-meta";

/** Sincroniza document.title con OTC | módulo actual. */
export function PlatformDocumentTitle() {
  const pathname = usePathname();

  useEffect(() => {
    const { title } = getPageMeta(pathname);
    document.title = `OTC | ${title}`;
  }, [pathname]);

  return null;
}

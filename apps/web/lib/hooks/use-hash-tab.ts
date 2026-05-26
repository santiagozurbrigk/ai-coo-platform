"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

function readHashTab(defaultTab: string): string {
  if (typeof window === "undefined") return defaultTab;
  const hash = window.location.hash.replace(/^#/, "");
  return hash || defaultTab;
}

function subscribeHashTab(onStoreChange: () => void) {
  const notify = () => onStoreChange();
  window.addEventListener("hashchange", notify);
  window.addEventListener("popstate", notify);
  return () => {
    window.removeEventListener("hashchange", notify);
    window.removeEventListener("popstate", notify);
  };
}

/**
 * Cambia la pestaña por hash en la ruta actual sin recargar.
 * Necesario porque `<Link href="/ruta#tab">` en App Router no dispara `hashchange`.
 * @returns true si se manejó en cliente (el caller debe hacer preventDefault en el click).
 */
export function pushHashTab(href: string): boolean {
  if (typeof window === "undefined") return false;

  const url = new URL(href, window.location.origin);
  const hash = url.hash.replace(/^#/, "");
  if (!hash) return false;
  if (url.pathname !== window.location.pathname) return false;

  const nextUrl = `${url.pathname}#${hash}`;
  if (`${window.location.pathname}${window.location.hash}` === nextUrl) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return true;
  }

  window.history.pushState(null, "", nextUrl);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
  return true;
}

/** Sincroniza la pestaña activa con `location.hash` (sin `#`). */
export function useHashTab(defaultTab: string) {
  // Re-render al cambiar de ruta (p. ej. llegar desde otra página con `#tab` en la URL).
  usePathname();

  return useSyncExternalStore(
    subscribeHashTab,
    () => readHashTab(defaultTab),
    () => defaultTab
  );
}

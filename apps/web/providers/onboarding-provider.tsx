"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { OnboardingItemId } from "@/lib/onboarding/items";
import { applyLocalDismissals } from "@/lib/onboarding/derive";
import type { OnboardingState } from "@/lib/onboarding/derive";

type OnboardingContextValue = {
  /** `null` cuando no aplica: sin sesión, sin Supabase, o cuenta invitada. */
  state: OnboardingState | null;
  /** Oculta el ítem de inmediato, sin esperar a que el servidor confirme. */
  dismissLocally: (itemId: OnboardingItemId) => void;
};

const OnboardingCtx = createContext<OnboardingContextValue>({
  state: null,
  dismissLocally: () => {},
});

/**
 * El estado llega resuelto desde el layout, que es un Server Component: así el
 * checklist se pinta con la primera respuesta en vez de aparecer un segundo
 * después de que la página ya se vio.
 *
 * Lo único que el cliente maneja por su cuenta son los descartes, para que el
 * ítem desaparezca al toque y no al revalidar.
 */
export function OnboardingProvider({
  value,
  children,
}: {
  value: OnboardingState | null;
  children: ReactNode;
}) {
  const [locallyDismissed, setLocallyDismissed] = useState<OnboardingItemId[]>([]);

  const contextValue = useMemo<OnboardingContextValue>(() => {
    const dismissLocally = (id: OnboardingItemId) =>
      setLocallyDismissed((prev) => (prev.includes(id) ? prev : [...prev, id]));

    if (!value) return { state: null, dismissLocally };

    return {
      state: applyLocalDismissals(value, locallyDismissed),
      dismissLocally,
    };
  }, [value, locallyDismissed]);

  return (
    <OnboardingCtx.Provider value={contextValue}>{children}</OnboardingCtx.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  return useContext(OnboardingCtx);
}

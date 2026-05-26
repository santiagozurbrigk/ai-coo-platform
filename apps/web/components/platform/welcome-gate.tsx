"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  completeWelcome,
  shouldPlayWelcome,
} from "@/lib/onboarding/welcome-storage";
import { CinematicWelcome } from "@/components/welcome/cinematic-welcome";

const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

function readShouldPlayWelcome(): boolean {
  return typeof window !== "undefined" && shouldPlayWelcome();
}

/**
 * Reproduce la animación de bienvenida una sola vez tras completar el onboarding,
 * antes de mostrar el panel.
 */
export function WelcomeGate({ children }: { children: React.ReactNode }) {
  const [showWelcome, setShowWelcome] = useState(readShouldPlayWelcome);
  const [dashboardVisible, setDashboardVisible] = useState(
    () => !readShouldPlayWelcome()
  );

  useLayoutEffect(() => {
    const play = shouldPlayWelcome();
    setShowWelcome(play);
    setDashboardVisible(!play);
  }, []);

  const handleRevealDashboard = useCallback(() => {
    setDashboardVisible(true);
  }, []);

  const handleComplete = useCallback(() => {
    completeWelcome();
    setShowWelcome(false);
  }, []);

  // Si el overlay se desmonta sin completar, no dejar el panel invisible
  useEffect(() => {
    if (!showWelcome && !dashboardVisible) {
      setDashboardVisible(true);
    }
  }, [showWelcome, dashboardVisible]);

  return (
    <>
      <motion.div
        className="min-h-0 flex-1"
        initial={false}
        animate={{ opacity: dashboardVisible ? 1 : 0 }}
        transition={{ duration: 0.6, ease: EASE_IN }}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {showWelcome && (
          <CinematicWelcome
            key="cinematic-welcome"
            onRevealDashboard={handleRevealDashboard}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

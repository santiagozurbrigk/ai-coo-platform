"use client";

import { BGPattern } from "@/components/ui/bg-pattern";
import { useTheme } from "@/providers/theme-provider";

/** Patrón de fondo del panel principal (dots + máscara fade-center). */
export function MainContainerBackground() {
  const { theme } = useTheme();
  const fill =
    theme === "dark" ? "rgba(255, 255, 255, 0.07)" : "rgba(0, 0, 0, 0.05)";

  return (
    <BGPattern variant="dots" mask="fade-center" size={24} fill={fill} />
  );
}

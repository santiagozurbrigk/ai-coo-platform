"use client";

import { BGPattern } from "@/components/ui/bg-pattern";
import { useTheme } from "@/providers/theme-provider";

/** Patrón de fondo del panel principal (grid + máscara fade). */
export function MainContainerBackground() {
  const { theme } = useTheme();
  const fill =
    theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";

  return (
    <BGPattern variant="grid" mask="fade-edges" size={28} fill={fill} />
  );
}

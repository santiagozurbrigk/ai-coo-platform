/** Series de 7 puntos para sparklines (solo visual; no alteran valores mostrados). */

export const SPARKLINE_SERIES = {
  revenue: [18200, 19400, 17800, 21000, 22400, 24100, 27600],
  bookingRate: [34, 36, 33, 38, 40, 39, 43],
  ghostingRate: [28, 26, 29, 24, 22, 20, 18],
  responseTime: [4.2, 3.8, 4.1, 3.5, 3.2, 2.9, 2.7],
  conversations: [142, 158, 149, 171, 183, 196, 228],
  reach: [38000, 52000, 41000, 67000, 58000, 71000, 89000],
  interactions: [2100, 2450, 2280, 2900, 3100, 3350, 3820],
  margin: [54, 56, 53, 57, 58, 57, 59],
  cashCollected: [11200, 12400, 10800, 13200, 14100, 15400, 16240],
  porCobrar: [4200, 4800, 5100, 4600, 5200, 4900, 5400],
  expenses: [8200, 7900, 8100, 7800, 7600, 7400, 7200],
  teamLoad: [68, 70, 74, 71, 69, 73, 72],
  salesInfluenced: [2, 3, 2, 4, 5, 4, 6],
  storyReplies: [45, 52, 48, 61, 58, 73, 89],
  totalComments: [1200, 1340, 1280, 1450, 1560, 1720, 1847],
  profileGrowth: [420, 580, 510, 720, 890, 1040, 1240],
  viewsToFollowers: [1.8, 2.0, 1.9, 2.1, 2.2, 2.3, 2.4],
} as const;

export const SPARKLINE_COLORS = {
  revenue: "#34D399",
  cashCollected: "#34D399",
  bookingRate: "#7C3AED",
  ghostingRate: "#F87171",
  responseTime: "#FBBF24",
  conversations: "#60A5FA",
  reach: "#A78BFA",
  interactions: "#60A5FA",
  margin: "#34D399",
  porCobrar: "#FBBF24",
  expenses: "#F87171",
  teamLoad: "#FBBF24",
  salesInfluenced: "#34D399",
  storyReplies: "#F472B6",
  totalComments: "#60A5FA",
  profileGrowth: "#34D399",
  viewsToFollowers: "#A78BFA",
} as const;

export type SparklinePreset = keyof typeof SPARKLINE_SERIES;

export function sparklineProps(
  preset: SparklinePreset,
  animationDelay = 0
) {
  return {
    sparklineData: [...SPARKLINE_SERIES[preset]],
    sparklineColor: SPARKLINE_COLORS[preset],
    sparklineAnimationDelay: animationDelay,
  };
}

/** Panel General — por id de métrica en mock dashboard. */
export const DASHBOARD_SPARKLINE_BY_ID: Partial<
  Record<string, SparklinePreset>
> = {
  m1: "revenue",
  m2: "revenue",
  s2: "bookingRate",
  s5: "conversations",
  o1: "teamLoad",
};

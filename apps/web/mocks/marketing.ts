import type {
  ClosedBuyerJourney,
  ContentFunnelStage,
  ContentTypePerformance,
  FollowerGrowthPoint,
  HeatmapCell,
  MarketingOverviewMetrics,
  MarketingTimePoint,
  SalesContentRank,
} from "@/types/marketing-insights";

export const mockMarketingOverview: MarketingOverviewMetrics = {
  totalReach: 508_600,
  reachTrendPct: 12.4,
  totalInteractions: 15_400,
  engagementRatePct: 3.03,
  interactionsTrendPct: 8.1,
  contentPublished: 47,
  reelsCount: 28,
  postsCount: 9,
  storiesCount: 10,
  conversationsGenerated: 228,
  bookingsInfluenced: 57,
  bookingsInfluencedPct: 42,
  salesInfluenced: 19,
  revenueInfluenced: 57_000,
  followers: 24_800,
  newFollowers: 1_240,
};

export const mockReachTimeSeries: MarketingTimePoint[] = Array.from(
  { length: 30 },
  (_, i) => {
    const day = i + 1;
    const base = 12000 + Math.sin(i / 4) * 4000;
    return {
      day: `${day}`,
      reach: Math.round(base + i * 180),
      interactions: Math.round(base * 0.03 + (i % 7) * 120),
    };
  }
);

export const mockContentFunnel: ContentFunnelStage[] = [
  { stage: "Impresiones", value: 892_000, conversionToNextPct: 4.2 },
  { stage: "Interacciones", value: 37_464, conversionToNextPct: 6.1 },
  { stage: "Conversaciones", value: 2_285, conversionToNextPct: 25 },
  { stage: "Bookings", value: 571, conversionToNextPct: 33.3 },
  { stage: "Ventas", value: 190 },
];

export const mockTypePerformance: ContentTypePerformance[] = [
  { type: "reel", reach: 380_000, conversions: 142 },
  { type: "post", reach: 42_000, conversions: 18 },
  { type: "story", reach: 48_000, conversions: 38 },
  { type: "carousel", reach: 28_600, conversions: 22 },
  { type: "vsl", reach: 10_000, conversions: 12 },
];

export const mockPublishHeatmap: HeatmapCell[] = (() => {
  const cells: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour += 2) {
      const peak =
        (day === 4 && hour >= 18 && hour <= 20) ||
        (day === 2 && hour >= 12 && hour <= 14);
      cells.push({
        day,
        hour,
        engagement: peak ? 0.85 + Math.random() * 0.15 : 0.15 + Math.random() * 0.5,
      });
    }
  }
  return cells;
})();

export const mockFollowerGrowth: FollowerGrowthPoint[] = [
  { week: "Sem 1", followers: 23_100 },
  { week: "Sem 2", followers: 23_420 },
  { week: "Sem 3", followers: 23_680, spikeLabel: "Reel: Cómo escalar a 100k" },
  { week: "Sem 4", followers: 24_050 },
  { week: "Sem 5", followers: 24_320, spikeLabel: "Reel: Por qué tu equipo..." },
  { week: "Sem 6", followers: 24_520 },
  { week: "Sem 7", followers: 24_680 },
  { week: "Sem 8", followers: 24_800 },
];

export const mockSalesContentRank: SalesContentRank[] = [
  { contentId: "c9", salesCount: 9, revenue: 27_000 },
  { contentId: "c1", salesCount: 4, revenue: 12_000 },
  { contentId: "c2", salesCount: 3, revenue: 9_000 },
];

export const mockClosedBuyerJourneys: ClosedBuyerJourney[] = [
  {
    id: "bj1",
    leadName: "Laura Gómez",
    clientId: "client1",
    closedAmount: 3000,
    outcome: "closed",
    steps: [
      { type: "content", contentId: "c9", label: "Por qué tu equipo te necesita demasiado", date: "28 abr" },
      { type: "content", contentId: "c10", label: "¿Cuánto facturás por mes?", date: "14 may" },
      { type: "dm", label: "DM", date: "18 may" },
      { type: "booking", label: "Booking", date: "20 may" },
      { type: "sale", label: "Venta", date: "24 may" },
    ],
  },
  {
    id: "bj2",
    leadName: "Carlos Vega",
    clientId: "client2",
    closedAmount: 3000,
    outcome: "closed",
    steps: [
      { type: "content", contentId: "c1", label: "Cómo escalar a 100k", date: "12 may" },
      { type: "content", contentId: "c4", label: "Framework de delegación", date: "22 abr" },
      { type: "dm", label: "DM", date: "10 may" },
      { type: "booking", label: "Booking", date: "12 may" },
      { type: "sale", label: "Venta", date: "15 may" },
    ],
  },
];

export type AdditionalMarketingMetric = {
  value: number;
  trend: number;
  sparkData: number[];
  label?: string;
  suffix?: string;
};

export const additionalMarketingMetrics: Record<
  | "storyReplies"
  | "conversationsGenerated"
  | "totalComments"
  | "profileGrowth"
  | "viewsToFollowersRate",
  AdditionalMarketingMetric
> = {
  storyReplies: {
    value: 89,
    trend: 12.3,
    sparkData: [45, 52, 48, 61, 58, 73, 89],
  },
  conversationsGenerated: {
    value: 228,
    trend: 8.7,
    sparkData: [142, 158, 149, 171, 183, 196, 228],
  },
  totalComments: {
    value: 1847,
    trend: 5.2,
    sparkData: [1200, 1340, 1280, 1450, 1560, 1720, 1847],
  },
  profileGrowth: {
    value: 1240,
    label: "Nuevos seguidores",
    trend: 18.4,
    sparkData: [420, 580, 510, 720, 890, 1040, 1240],
  },
  viewsToFollowersRate: {
    value: 2.4,
    label: "% views → seguidores",
    trend: 0.3,
    sparkData: [1.8, 2.0, 1.9, 2.1, 2.2, 2.3, 2.4],
    suffix: "%",
  },
};

export const mockMarketingOverviewInsights = [
  "Tus Reels generan 3.4x más conversaciones que tus Posts. Priorizá Reels este mes.",
  "El 68% de las ventas cerradas este mes interactuaron con al menos un Reel antes de escribirte.",
  "Los jueves entre 19:00 y 21:00 son tu mejor ventana de publicación según engagement histórico.",
  "Este Reel aparece en el 54% de los journeys de leads que terminaron comprando.",
];

export const mockSalesConnectionPatterns = [
  "El 78% de tus compradores interactuaron con al menos un Reel antes de escribirte.",
  "El journey promedio de compra dura 8 días desde el primer contacto con tu contenido.",
  "Los compradores interactúan con un promedio de 2.3 piezas de contenido antes de iniciar una conversación.",
  "Tus Reels sobre «errores y problemas» convierten 2.1x más que tus Reels educativos.",
];

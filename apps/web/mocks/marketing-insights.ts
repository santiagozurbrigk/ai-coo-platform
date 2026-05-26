import type {
  BuyerJourneyPattern,
  ContentAsset,
  InfluenceRankItem,
  LeadJourney,
  MarketingAiInsight,
} from "@/types/marketing-insights";

type AssetInput = Omit<
  ContentAsset,
  "interactions" | "impressions" | "revenueInfluenced" | "revenueInfluencedAmount"
> & {
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  journeyTouch?: ContentAsset["journeyTouch"];
};

function asset(base: AssetInput): ContentAsset {
  const interactions = base.likes + base.comments + base.saves + base.shares;
  const revenueInfluencedAmount = base.salesInfluenced * 3000;
  return {
    ...base,
    interactions,
    impressions: Math.round(base.reach * 1.52),
    revenueInfluencedAmount,
    revenueInfluenced: `$${revenueInfluencedAmount.toLocaleString("es-ES")}`,
    journeyTouch: base.journeyTouch ?? {
      firstTouchPct: 34,
      middleTouchPct: 48,
      lastBeforeDmPct: 18,
    },
  };
}

export const mockContentAssets: ContentAsset[] = [
  asset({
    id: "c1",
    title: "Cómo escalar a 100k",
    type: "reel",
    createdAt: "2026-05-12",
    publishDate: "12 may 2026",
    driveSource: "Instagram",
    status: "active",
    thumbnailHue: 262,
    reach: 124_500,
    likes: 2800,
    comments: 312,
    saves: 890,
    shares: 198,
    conversationsGenerated: 47,
    bookingsInfluenced: 12,
    salesInfluenced: 4,
    journeyParticipationPct: 54,
    journeyTouch: { firstTouchPct: 28, middleTouchPct: 52, lastBeforeDmPct: 20 },
  }),
  asset({
    id: "c2",
    title: "El error más común de los setters",
    type: "reel",
    createdAt: "2026-05-08",
    publishDate: "8 may 2026",
    driveSource: "Instagram",
    status: "active",
    thumbnailHue: 280,
    reach: 89_200,
    likes: 1800,
    comments: 210,
    saves: 520,
    shares: 120,
    conversationsGenerated: 31,
    bookingsInfluenced: 8,
    salesInfluenced: 3,
    journeyParticipationPct: 41,
  }),
  asset({
    id: "c3",
    title: "Sistema operativo para tu negocio",
    type: "carousel",
    createdAt: "2026-05-05",
    publishDate: "5 may 2026",
    driveSource: "Instagram",
    status: "active",
    thumbnailHue: 152,
    reach: 45_600,
    likes: 1200,
    comments: 180,
    saves: 340,
    shares: 80,
    conversationsGenerated: 19,
    bookingsInfluenced: 5,
    salesInfluenced: 2,
    journeyParticipationPct: 22,
  }),
  asset({
    id: "c9",
    title: "Por qué tu equipo te necesita demasiado",
    type: "reel",
    createdAt: "2026-04-28",
    publishDate: "28 abr 2026",
    driveSource: "Instagram",
    status: "active",
    thumbnailHue: 38,
    reach: 210_000,
    likes: 5800,
    comments: 640,
    saves: 2100,
    shares: 420,
    conversationsGenerated: 89,
    bookingsInfluenced: 23,
    salesInfluenced: 9,
    journeyParticipationPct: 62,
    journeyTouch: { firstTouchPct: 42, middleTouchPct: 38, lastBeforeDmPct: 20 },
  }),
  asset({
    id: "c4",
    title: "Framework de delegación",
    type: "carousel",
    createdAt: "2026-04-22",
    publishDate: "22 abr 2026",
    driveSource: "Instagram",
    status: "active",
    thumbnailHue: 199,
    reach: 38_900,
    likes: 900,
    comments: 120,
    saves: 280,
    shares: 60,
    conversationsGenerated: 14,
    bookingsInfluenced: 3,
    salesInfluenced: 1,
    journeyParticipationPct: 18,
  }),
  asset({
    id: "c10",
    title: "¿Cuánto facturás por mes?",
    type: "story",
    createdAt: "2026-05-14",
    publishDate: "14 may 2026",
    driveSource: "Instagram",
    status: "active",
    thumbnailHue: 180,
    reach: 12_400,
    likes: 620,
    comments: 140,
    saves: 90,
    shares: 40,
    conversationsGenerated: 28,
    bookingsInfluenced: 6,
    salesInfluenced: 2,
    journeyParticipationPct: 35,
    journeyTouch: { firstTouchPct: 12, middleTouchPct: 28, lastBeforeDmPct: 60 },
  }),
  asset({
    id: "c6",
    title: "VSL — Oferta high ticket Q2",
    type: "vsl",
    createdAt: "2026-05-10",
    publishDate: "10 may 2026",
    driveSource: "Instagram",
    status: "active",
    thumbnailHue: 0,
    reach: 10_000,
    likes: 280,
    comments: 45,
    saves: 120,
    shares: 30,
    conversationsGenerated: 52,
    bookingsInfluenced: 18,
    salesInfluenced: 8,
    journeyParticipationPct: 22,
  }),
  asset({
    id: "c7",
    title: "3 señales antes de agendar",
    type: "post",
    createdAt: "2026-05-14",
    publishDate: "14 may 2026",
    driveSource: "Instagram",
    status: "active",
    thumbnailHue: 220,
    reach: 18_200,
    likes: 420,
    comments: 88,
    saves: 110,
    shares: 35,
    conversationsGenerated: 29,
    bookingsInfluenced: 8,
    salesInfluenced: 2,
    journeyParticipationPct: 12,
  }),
];

export const mockBookingInfluence: InfluenceRankItem[] = [
  { contentId: "c9", rank: 1, metricLabel: "Agendamientos influenciados", metricValue: "23" },
  { contentId: "c1", rank: 2, metricLabel: "Agendamientos influenciados", metricValue: "12" },
  { contentId: "c2", rank: 3, metricLabel: "Agendamientos influenciados", metricValue: "8" },
];

export const mockSalesInfluence: InfluenceRankItem[] = [
  { contentId: "c9", rank: 1, metricLabel: "Ventas influenciadas", metricValue: "9 · $27K" },
  { contentId: "c1", rank: 2, metricLabel: "Ventas influenciadas", metricValue: "4 · $12K" },
  { contentId: "c2", rank: 3, metricLabel: "Ventas influenciadas", metricValue: "3 · $9K" },
];

export const mockCommonJourney: BuyerJourneyPattern = {
  id: "pattern-1",
  label: "Recorrido más frecuente antes de agendar",
  percentage: 62,
  steps: [
    { type: "reel", label: "Reel" },
    { type: "story", label: "Story" },
    { type: "dm", label: "DM" },
    { type: "booking", label: "Agendamiento" },
    { type: "sale", label: "Venta" },
  ],
};

export const mockFunnel = [
  { stage: "Contenido visto", value: 8420, pct: 100 },
  { stage: "Conversación", value: 610, pct: 7.2 },
  { stage: "Agendamiento", value: 124, pct: 1.5 },
  { stage: "Venta", value: 42, pct: 0.5 },
];

export const mockMarketingAiInsights: MarketingAiInsight[] = [
  {
    id: "mi1",
    title: "Reels dominan conversaciones",
    body: "Tus Reels generan 3.4x más conversaciones que tus Posts. Priorizá Reels este mes.",
    confidence: 0.91,
  },
  {
    id: "mi2",
    title: "Reels antes de compra",
    body: "El 68% de las ventas cerradas este mes interactuaron con al menos un Reel antes de escribirte.",
    confidence: 0.88,
  },
  {
    id: "mi3",
    title: "Mejor horario",
    body: "Los jueves entre 19:00 y 21:00 son tu mejor ventana de publicación según engagement histórico.",
    confidence: 0.86,
  },
];

export const mockLeadJourneys: LeadJourney[] = [
  {
    id: "j1",
    leadName: "Laura Gómez",
    bookingStatus: "booked",
    saleStatus: "won",
    revenue: "$3,000",
    steps: [
      { type: "content", contentId: "c9", label: "Por qué tu equipo te necesita demasiado", date: "28 abr" },
      { type: "content", contentId: "c10", label: "¿Cuánto facturás por mes?", date: "14 may" },
      { type: "dm", label: "DM", date: "18 may" },
      { type: "booking", label: "Booking", date: "20 may" },
      { type: "sale", label: "Venta", date: "24 may" },
    ],
  },
  {
    id: "j2",
    leadName: "Carlos Vega",
    bookingStatus: "booked",
    saleStatus: "won",
    revenue: "$3,000",
    steps: [
      { type: "content", contentId: "c1", label: "Cómo escalar a 100k", date: "12 may" },
      { type: "content", contentId: "c4", label: "Framework de delegación", date: "22 abr" },
      { type: "dm", label: "DM", date: "10 may" },
      { type: "booking", label: "Booking", date: "12 may" },
      { type: "sale", label: "Venta", date: "15 may" },
    ],
  },
  {
    id: "j3",
    leadName: "Sofía Martins",
    bookingStatus: "booked",
    saleStatus: "won",
    revenue: "$12,200",
    steps: [
      { type: "content", contentId: "c6", label: "VSL Oferta high ticket", date: "10 may" },
      { type: "dm", label: "DM", date: "11 may" },
      { type: "booking", label: "Agendamiento", date: "13 may" },
      { type: "sale", label: "Venta", date: "18 may" },
    ],
  },
];

export function getContentById(id: string): ContentAsset | undefined {
  return mockContentAssets.find((c) => c.id === id);
}

export function getLeadJourneyById(id: string): LeadJourney | undefined {
  return mockLeadJourneys.find((j) => j.id === id);
}

export function getLeadJourneyByLeadName(leadName: string): LeadJourney | undefined {
  return mockLeadJourneys.find(
    (j) => j.leadName.toLowerCase() === leadName.toLowerCase()
  );
}

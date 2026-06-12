export type OrganicContentType = "reels" | "youtube" | "stories" | "posts";

export type ContentTypeMetrics = {
  type: OrganicContentType;
  label: string;
  avgReach: number;
  engagementRate: number;
  conversationsGenerated: number;
  bestPublishWindow: string;
};

export const mockContentMetricsByType: ContentTypeMetrics[] = [
  {
    type: "reels",
    label: "Reels",
    avgReach: 42_800,
    engagementRate: 4.2,
    conversationsGenerated: 128,
    bestPublishWindow: "Jue 18:00–20:00",
  },
  {
    type: "youtube",
    label: "YouTube",
    avgReach: 18_500,
    engagementRate: 6.8,
    conversationsGenerated: 45,
    bestPublishWindow: "Mar 10:00–12:00",
  },
  {
    type: "stories",
    label: "Stories",
    avgReach: 8_200,
    engagementRate: 2.1,
    conversationsGenerated: 32,
    bestPublishWindow: "Lun–Vie 09:00",
  },
  {
    type: "posts",
    label: "Posts",
    avgReach: 12_400,
    engagementRate: 3.5,
    conversationsGenerated: 23,
    bestPublishWindow: "Mié 12:00–14:00",
  },
];

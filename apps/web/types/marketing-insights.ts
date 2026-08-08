export type ContentType =
  | "reel"
  | "story"
  | "carousel"
  | "webinar"
  | "vsl"
  | "post";

export type ContentStatus = "active" | "archived";

export type ContentAsset = {
  id: string;
  title: string;
  type: ContentType;
  createdAt: string;
  publishDate: string;
  driveSource: string;
  status: ContentStatus;
  /** Token para gradiente de miniatura (mock) */
  thumbnailHue: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  interactions: number;
  conversationsGenerated: number;
  bookingsInfluenced: number;
  salesInfluenced: number;
  revenueInfluenced: string;
  revenueInfluencedAmount: number;
  journeyParticipationPct: number;
  journeyTouch?: {
    firstTouchPct: number;
    middleTouchPct: number;
    lastBeforeDmPct: number;
  };
};

export type MarketingOverviewMetrics = {
  totalReach: number;
  reachTrendPct: number;
  totalInteractions: number;
  engagementRatePct: number;
  interactionsTrendPct: number;
  contentPublished: number;
  reelsCount: number;
  postsCount: number;
  storiesCount: number;
  conversationsGenerated: number;
  bookingsInfluenced: number;
  bookingsInfluencedPct: number;
  salesInfluenced: number;
  revenueInfluenced: number;
  followers: number;
  newFollowers: number;
  storyReplies: number;
  storyRepliesTrendPct: number;
  commentsTotal: number;
  commentsTrendPct: number;
  viewsToFollowersRate: number;
  profileGrowthTrendPct: number;
};

export type MarketingTimePoint = {
  day: string;
  reach: number;
  interactions: number;
};

export type ContentFunnelStage = {
  stage: string;
  value: number;
  conversionToNextPct?: number;
};

export type ContentTypePerformance = {
  type: ContentType;
  reach: number;
  conversions: number;
};

export type HeatmapCell = {
  day: number;
  hour: number;
  engagement: number;
};

export type FollowerGrowthPoint = {
  week: string;
  followers: number;
  spikeLabel?: string;
};

export type SalesContentRank = {
  contentId: string;
  salesCount: number;
  revenue: number;
};

export type ClosedBuyerJourney = {
  id: string;
  leadName: string;
  clientId?: string;
  closedAmount: number;
  outcome: "closed" | "not_closed";
  steps: JourneyStep[];
};

export type JourneyStepType = "content" | "comment" | "story_reply" | "cta" | "dm" | "booking" | "sale";

export type JourneyStep = {
  type: JourneyStepType;
  contentId?: string;
  label: string;
  date?: string;
};

export type LeadJourney = {
  id: string;
  leadName: string;
  bookingStatus: "booked" | "pending" | "none";
  saleStatus: "won" | "lost" | "pending" | "none";
  revenue?: string;
  steps: JourneyStep[];
};

export type InfluenceRankItem = {
  contentId: string;
  rank: number;
  metricLabel: string;
  metricValue: string;
};

export type MarketingAiInsight = {
  id: string;
  title: string;
  body: string;
  confidence: number;
};

export type BuyerJourneyPattern = {
  id: string;
  label: string;
  percentage: number;
  steps: { type: ContentType | "dm" | "booking" | "sale"; label: string }[];
};

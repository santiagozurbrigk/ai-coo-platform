export type BrainContentType =
  | "document"
  | "image"
  | "transcript"
  | "miro"
  | "framework"
  | "playbook";

export type BrainContentStatus = "indexing" | "active" | "error" | "archived";

export type BrainCategory =
  | "sales_methodology"
  | "operational_systems"
  | "sop_frameworks"
  | "team_management"
  | "onboarding"
  | "content_strategy"
  | "financial"
  | "general";

export type CoverageLevel = "covered" | "partial" | "not_covered";

export type BrainDocument = {
  id: string;
  title: string;
  type: BrainContentType;
  category: BrainCategory;
  categoryLabel: string;
  size: string;
  status: BrainContentStatus;
  uploadedBy: string;
  uploadDate: string;
  description?: string;
  tags?: string[];
  coverageAreas: string[];
  usageStats: {
    sops: number;
    sales: number;
    reports: number;
    lastReferenced: string;
  };
  previewText?: string;
};

export type BrainHealth = {
  status: "active" | "maintenance" | "degraded";
  documentsLoaded: number;
  frameworks: number;
  transcripts: number;
  images: number;
  miroBoards: number;
  lastUpdated: string;
};

export type BrainContentBreakdown = {
  type: BrainContentType;
  label: string;
  count: number;
  pct: number;
};

export type BrainCoverageArea = {
  id: string;
  label: string;
  level: CoverageLevel;
  docCount?: number;
};

export type BrainGlobalInsight = {
  id: string;
  title: string;
  body: string;
  tone: "positive" | "warning";
};

export type BrainRecentItem = {
  id: string;
  title: string;
  type: BrainContentType;
  uploadedBy: string;
  uploadDate: string;
  status: BrainContentStatus;
};

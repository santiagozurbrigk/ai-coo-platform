export type IntelligenceInsight = {
  id: string;
  title: string;
  body: string;
  confidence: number;
  department: string;
  createdAt: string;
};

export type IntelligenceRecommendation = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  action: string;
};

export type IntelligenceBottleneck = {
  id: string;
  area: string;
  impact: string;
  frequency: string;
};

export type IntelligenceOpportunity = {
  id: string;
  title: string;
  potential: string;
};

export type MemoryChunk = {
  id: string;
  label: string;
  type: string;
  lastAccessed: string;
};

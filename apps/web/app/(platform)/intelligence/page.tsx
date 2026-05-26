import { IntelligenceOverview } from "@/components/intelligence/intelligence-overview";
import {
  mockBottlenecks,
  mockInsights,
  mockMemoryChunks,
  mockOpportunities,
  mockRecommendations,
} from "@/mocks";

export default function IntelligencePage() {
  return (
    <IntelligenceOverview
      insights={mockInsights}
      recommendations={mockRecommendations}
      bottlenecks={mockBottlenecks}
      opportunities={mockOpportunities}
      memoryChunks={mockMemoryChunks}
    />
  );
}

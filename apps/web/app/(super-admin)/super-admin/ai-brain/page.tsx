import { BrainDashboard } from "@/components/ai-brain/brain-dashboard";
import {
  mockBrainContentBreakdown,
  mockBrainCoverageAreas,
  mockBrainGlobalInsights,
  mockBrainHealth,
  mockBrainRecent,
} from "@/mocks/ai-brain";

export default function AiBrainDashboardPage() {
  return (
    <BrainDashboard
      health={mockBrainHealth}
      breakdown={mockBrainContentBreakdown}
      coverage={mockBrainCoverageAreas}
      insights={mockBrainGlobalInsights}
      recent={mockBrainRecent}
    />
  );
}

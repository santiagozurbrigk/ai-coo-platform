import { RecommendationCard } from "@/components/intelligence";
import { mockRecommendations } from "@/mocks";

export default function IntelligenceRecommendationsPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {mockRecommendations.map((r) => (
        <RecommendationCard key={r.id} item={r} />
      ))}
    </div>
  );
}

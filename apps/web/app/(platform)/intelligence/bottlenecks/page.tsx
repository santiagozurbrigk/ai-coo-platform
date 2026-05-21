import { BottleneckCard } from "@/components/intelligence";
import { mockBottlenecks } from "@/mocks";

export default function IntelligenceBottlenecksPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {mockBottlenecks.map((b) => (
        <BottleneckCard key={b.id} item={b} />
      ))}
    </div>
  );
}

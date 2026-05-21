import { MemoryList } from "@/components/intelligence";
import { mockMemoryChunks } from "@/mocks";

export default function IntelligenceAiMemoryPage() {
  return <MemoryList chunks={mockMemoryChunks} />;
}

import { SopsOverview } from "@/components/sops/sops-overview";
import { mockSops } from "@/mocks";

export default function SopsPage() {
  return <SopsOverview sops={mockSops} />;
}

import { SopsOverview } from "@/components/sops";
import { mockSops } from "@/mocks";

export default function OperationsSopsPage() {
  return <SopsOverview sops={mockSops} />;
}

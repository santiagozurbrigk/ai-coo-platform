import { SopsOverview } from "@/components/sops/sops-overview";
import { listSops } from "@/lib/sops/queries";

export default async function SopsPage() {
  const sops = await listSops();
  return <SopsOverview sops={sops} />;
}

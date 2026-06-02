import { SopsOverview } from "@/components/sops";
import { listSops } from "@/lib/sops/queries";

export default async function OperationsSopsPage() {
  const sops = await listSops();
  return <SopsOverview sops={sops} />;
}

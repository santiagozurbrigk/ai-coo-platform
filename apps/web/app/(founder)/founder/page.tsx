import { FounderOverview } from "@/components/founder";
import { getIntelligenceSnapshotAction } from "@/app/intelligence/actions";

export default async function FounderAreaPage() {
  const snapshot = await getIntelligenceSnapshotAction();
  return <FounderOverview snapshot={snapshot} />;
}

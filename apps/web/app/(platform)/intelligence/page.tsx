import { getIntelligenceSnapshotAction } from "@/app/intelligence/actions";
import { IntelligencePageContent } from "@/components/intelligence/intelligence-page-content";

export default async function IntelligencePage() {
  const snapshot = await getIntelligenceSnapshotAction();
  return <IntelligencePageContent snapshot={snapshot} />;
}

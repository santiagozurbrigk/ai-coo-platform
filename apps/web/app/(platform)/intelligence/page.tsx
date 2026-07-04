import { getIntelligenceSnapshotAction } from "@/app/intelligence/actions";
import { IntelligencePageContent } from "@/components/intelligence/intelligence-page-content";
import { getCurrentProfile } from "@/lib/auth/bootstrap";

export default async function IntelligencePage() {
  const [snapshot, profile] = await Promise.all([
    getIntelligenceSnapshotAction(),
    getCurrentProfile(),
  ]);
  return (
    <IntelligencePageContent
      snapshot={snapshot}
      isFounder={profile?.role === "founder"}
    />
  );
}

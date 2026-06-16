import { redirect } from "next/navigation";
import { HoldingDashboardContent } from "@/components/holding/holding-dashboard-content";
import { getHoldingDashboardAction } from "@/app/(platform)/holding/actions";
import { getHoldingSessionState } from "@/lib/holding/session";
import { paths } from "@/routes";

export default async function HoldingPage() {
  const session = await getHoldingSessionState();
  if (!session.isHolding) {
    redirect(paths.platform.dashboard);
  }

  const data = await getHoldingDashboardAction();
  return <HoldingDashboardContent data={data} />;
}

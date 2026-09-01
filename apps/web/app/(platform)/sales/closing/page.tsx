import { Suspense } from "react";
import { ClosingOverview } from "@/components/closing";
import { PageLoading } from "@/components/shared/page-loading";
import { getGHLIntegrationStatusAction } from "@/app/ghl/actions";
import { listLeadsNeedingAttentionAction } from "@/app/sales/lead-actions";

async function ClosingPageContent() {
  const [ghlStatus, leadsNeedingAttention] = await Promise.all([
    getGHLIntegrationStatusAction(),
    listLeadsNeedingAttentionAction(),
  ]);

  return (
    <ClosingOverview
      ghlCalendars={ghlStatus.connected ? ghlStatus.connectedCalendars : []}
      ghlSelectedCalendarIds={ghlStatus.selectedCalendarIds}
      leadsNeedingAttention={leadsNeedingAttention}
    />
  );
}

export default function ClosingPage() {
  return (
    <Suspense fallback={<PageLoading label="Cargando closing…" />}>
      <ClosingPageContent />
    </Suspense>
  );
}

import { Suspense } from "react";
import { ClosingOverview } from "@/components/closing";
import { PageLoading } from "@/components/shared/page-loading";
import { getGHLIntegrationStatusAction } from "@/app/ghl/actions";

async function ClosingPageContent() {
  const ghlStatus = await getGHLIntegrationStatusAction();
  return (
    <ClosingOverview
      ghlCalendars={ghlStatus.connected ? ghlStatus.connectedCalendars : []}
      ghlSelectedCalendarIds={ghlStatus.selectedCalendarIds}
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

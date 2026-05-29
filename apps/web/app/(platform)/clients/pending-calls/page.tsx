import { PendingFathomCallsPage } from "@/components/clients/pending-fathom-calls";
import { listPendingFathomCallsAction } from "@/app/fathom/actions";

export default async function PendingCallsPage() {
  const calls = await listPendingFathomCallsAction();
  return <PendingFathomCallsPage initialCalls={calls} />;
}

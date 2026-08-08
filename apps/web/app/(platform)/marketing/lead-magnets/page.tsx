import { getLeadMagnetsAction } from "@/app/marketing/lead-magnets-actions";
import { LeadMagnetsOverview } from "@/components/marketing/lead-magnets/lead-magnets-overview";

export const metadata = { title: "Lead Magnets" };

export default async function LeadMagnetsPage() {
  const leadMagnets = await getLeadMagnetsAction();
  return <LeadMagnetsOverview initialLeadMagnets={leadMagnets} />;
}

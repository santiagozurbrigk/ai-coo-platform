import { WaitlistTable } from "@/components/super-admin/waitlist-table";
import { loadWaitlistLeads } from "@/lib/super-admin/waitlist-queries";

export default async function SuperAdminWaitlistPage() {
  const leads = await loadWaitlistLeads();
  return <WaitlistTable leads={leads} />;
}

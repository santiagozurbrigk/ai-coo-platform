import { TeamAccountsTable } from "@/components/super-admin";
import { mockTeamAccounts } from "@/mocks";

export default function SuperAdminTeamAccountsPage() {
  return <TeamAccountsTable accounts={mockTeamAccounts} />;
}

import { UsersTable } from "@/components/super-admin";
import { loadAdminUsers } from "@/lib/super-admin/queries";

export default async function SuperAdminUsersPage() {
  const users = await loadAdminUsers();
  return <UsersTable users={users} />;
}

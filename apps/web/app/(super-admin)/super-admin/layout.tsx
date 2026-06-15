import { redirect } from "next/navigation";
import { isSuperAdminUser } from "@/lib/auth/require-super-admin";
import { paths } from "@/routes";

export default async function SuperAdminGuardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const allowed = await isSuperAdminUser();
  if (!allowed) {
    redirect(paths.superAdmin.login);
  }
  return children;
}

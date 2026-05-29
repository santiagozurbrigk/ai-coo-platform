import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function SuperAdminTeamAccountsRedirect() {
  redirect(paths.superAdmin.users);
}

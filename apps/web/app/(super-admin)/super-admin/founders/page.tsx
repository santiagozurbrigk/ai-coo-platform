import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function SuperAdminFoundersRedirect() {
  redirect(paths.superAdmin.users);
}

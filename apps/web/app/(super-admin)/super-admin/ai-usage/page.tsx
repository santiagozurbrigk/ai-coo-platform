import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function SuperAdminAiUsageRedirect() {
  redirect(paths.superAdmin.profitability);
}

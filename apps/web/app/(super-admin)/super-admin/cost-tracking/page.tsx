import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function SuperAdminCostTrackingRedirect() {
  redirect(paths.superAdmin.costs);
}

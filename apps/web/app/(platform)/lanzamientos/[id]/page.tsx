import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default async function LaunchDetailPage() {
  redirect(paths.platform.dashboard);
}

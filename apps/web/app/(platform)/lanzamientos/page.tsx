import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default async function LanzamientosPage() {
  redirect(paths.platform.dashboard);
}

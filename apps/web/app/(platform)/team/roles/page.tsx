import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function TeamRolesRedirectPage() {
  redirect(`${paths.platform.team.root}#roles`);
}

import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function TeamMembersRedirectPage() {
  redirect(`${paths.platform.team.root}#miembros`);
}

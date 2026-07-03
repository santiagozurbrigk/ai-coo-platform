import { redirect } from "next/navigation";
import { paths } from "@/routes/paths";

export default async function AgentProjectPage() {
  redirect(paths.platform.agent.root);
}

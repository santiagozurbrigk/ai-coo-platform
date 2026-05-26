import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function IntelligenceOpportunitiesRedirectPage() {
  redirect(`${paths.platform.intelligence.root}#opportunities`);
}

import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function IntelligenceInsightsRedirectPage() {
  redirect(`${paths.platform.intelligence.root}#insights`);
}

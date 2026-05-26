import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function IntelligenceRecommendationsRedirectPage() {
  redirect(`${paths.platform.intelligence.root}#recommendations`);
}

import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function LegacyMarketingJourneysPage() {
  redirect(paths.platform.marketing.salesConnection);
}

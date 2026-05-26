import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function LeadJourneyDetailRedirectPage() {
  redirect(paths.platform.sales.inbox);
}

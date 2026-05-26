import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function LegacyMarketingLibraryPage() {
  redirect(paths.platform.marketing.content);
}

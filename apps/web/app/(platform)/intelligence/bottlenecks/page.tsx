import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function IntelligenceBottlenecksRedirectPage() {
  redirect(`${paths.platform.intelligence.root}#bottlenecks`);
}

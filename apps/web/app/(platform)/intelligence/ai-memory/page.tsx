import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function IntelligenceMemoryRedirectPage() {
  redirect(`${paths.platform.intelligence.root}#memoria`);
}

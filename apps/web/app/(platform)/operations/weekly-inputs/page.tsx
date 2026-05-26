import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function WeeklyInputsLegacyPage() {
  redirect(paths.platform.operations.teamInputs);
}

import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function WeeklyInputsRedirect() {
  redirect(paths.platform.operations.inputs);
}

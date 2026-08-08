import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function TeamInputsRedirect() {
  redirect(paths.platform.operations.inputs);
}

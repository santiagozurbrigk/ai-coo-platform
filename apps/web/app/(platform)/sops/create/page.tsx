import { redirect } from "next/navigation";
import { paths } from "@/routes";

export default function SopCreateRedirectPage() {
  redirect(`${paths.platform.sops.root}#crear`);
}

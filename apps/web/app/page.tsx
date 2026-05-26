import { redirect } from "next/navigation";
import { paths } from "@/routes";

/** Punto de entrada por defecto: login del panel cliente. */
export default function HomePage() {
  redirect(paths.auth.login);
}

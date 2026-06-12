import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Optimiza Tu Control — Sistema operativo para infoproductos",
  description:
    "Conectá tus herramientas, la IA analiza todo, y cada mañana sabés qué está pasando, por qué, y qué hacer.",
};

export default function HomePage() {
  return <LandingPage />;
}

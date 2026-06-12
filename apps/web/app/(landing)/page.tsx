import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingPage } from "@/components/landing/landing-page";
import { UTMCapture } from "@/components/landing/utm-capture";

export const metadata: Metadata = {
  title: "Optimiza Tu Control — Sistema operativo para infoproductos",
  description:
    "Conectá tus herramientas, la IA analiza todo, y cada mañana sabés qué está pasando, por qué, y qué hacer.",
};

const UTM_ORG_ID = process.env.NEXT_PUBLIC_UTM_ORGANIZATION_ID?.trim() ?? "";

export default function HomePage() {
  return (
    <>
      <Suspense fallback={null}>
        <UTMCapture organizationId={UTM_ORG_ID} />
      </Suspense>
      <LandingPage />
    </>
  );
}

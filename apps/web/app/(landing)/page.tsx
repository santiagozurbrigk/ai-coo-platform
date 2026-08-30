import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingPage } from "@/components/landing/landing-page";
import { UTMCapture } from "@/components/landing/utm-capture";

export const metadata: Metadata = {
  title: "Probalo gratis 3 días. Sin tarjeta de crédito.",
  description:
    "El sistema operativo para infoproductores. Ventas, clientes, marketing, finanzas y operaciones en un solo lugar. Onboarding personalizado incluido.",
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

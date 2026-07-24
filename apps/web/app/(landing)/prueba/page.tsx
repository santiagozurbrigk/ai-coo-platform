import type { Metadata } from "next";
import { ConfirmTrialForm } from "@/components/landing/confirm-trial-form";

export const metadata: Metadata = {
  title: "Confirmá tu prueba gratis — OTC",
  description: "Completá tus datos para asegurar tu acceso de 3 días a OTC.",
  robots: { index: false, follow: false },
};

export default function PruebaPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-20">
      <ConfirmTrialForm />
    </div>
  );
}

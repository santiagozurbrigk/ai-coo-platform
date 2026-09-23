import type { Metadata } from "next";
import { OnboardingForm } from "@/components/client-onboarding/onboarding-form";
import { buildOnboardingSteps, initialAnswers } from "@/lib/client-onboarding/form";
import { loadOnboardingByToken } from "@/lib/client-onboarding/public";
import { brand } from "@/lib/brand";

/**
 * El formulario de onboarding que completa el cliente de un growth partner.
 *
 * ⭐ Pública y sin sesión (ver `lib/supabase/public-paths.ts`): la protege el
 * token del link. No lleva el layout de la landing a propósito: ese layout
 * carga el píxel de Meta, y un formulario con los números de un negocio no es
 * lugar para medir conversiones.
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Onboarding",
  robots: { index: false, follow: false },
};

export default async function ClientOnboardingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const form = await loadOnboardingByToken(token);

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-primary">
          {brand.wordmark}
        </p>

        {!form ? (
          <div className="rounded-2xl border border-border p-8 text-center">
            <h1 className="text-xl font-semibold">Este link no está activo</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Puede que lo hayan reemplazado por uno nuevo. Pedíselo a tu contacto del equipo.
            </p>
          </div>
        ) : form.fields.length === 0 ? (
          <div className="rounded-2xl border border-border p-8 text-center">
            <h1 className="text-xl font-semibold">El formulario todavía no está listo</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Avisale a tu contacto del equipo: todavía no cargó las preguntas.
            </p>
          </div>
        ) : (
          <OnboardingForm
            token={token}
            creatorName={form.subClient?.name ?? null}
            steps={buildOnboardingSteps(form.fields)}
            initial={initialAnswers(form.fields, form.subClient?.custom ?? {})}
          />
        )}
      </div>
    </main>
  );
}

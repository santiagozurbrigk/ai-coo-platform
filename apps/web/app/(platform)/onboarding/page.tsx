import { redirect } from "next/navigation";
import { OnboardingGate } from "@/components/onboarding/onboarding-gate";
import {
  getOnboardingGateDefaultsAction,
  getOnboardingStateAction,
  skipSatisfiedGateAction,
} from "@/app/onboarding/actions";
import { firstPendingGateStep } from "@/lib/onboarding/derive";
import { paths } from "@/routes/paths";

/**
 * Gate de onboarding.
 *
 * El middleware sólo mira `gate_completed_at`, que es una consulta barata que
 * corre en cada request. La derivación completa —¿ya tiene oferta? ¿avatar?—
 * se hace acá, que es la única pantalla que la necesita.
 */
export default async function OnboardingPage() {
  const state = await getOnboardingStateAction();

  // Sin Supabase configurado (modo demo) no hay nada que configurar.
  if (!state) redirect(paths.platform.dashboard);

  // Ya lo cruzó y volvió a la URL a mano.
  if (state.gate.passed) redirect(paths.platform.dashboard);

  // Los datos ya estaban cargados por fuera del wizard: se cierra el gate y se
  // sigue de largo en vez de hacerle repetir tres pantallas completas.
  if (state.gate.satisfied) await skipSatisfiedGateAction();

  const defaults = await getOnboardingGateDefaultsAction();

  return (
    <OnboardingGate
      defaults={defaults}
      initialStep={firstPendingGateStep(state) as 0 | 1 | 2}
    />
  );
}

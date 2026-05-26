"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button, GlassPanel, Input, Text, cn } from "@ai-coo/ui";
import {
  getVisibleSteps,
  isStepValid,
  BUSINESS_TYPES,
  REVENUE_RANGES,
  TEAM_SIZES,
  DEPARTMENT_OPTIONS,
  SALES_VOLUMES,
  DELIVERY_MODELS,
  ONBOARDING_PROCESS_OPTIONS,
  CHALLENGE_OPTIONS,
  TOOL_OPTIONS,
  REPORTING_OPTIONS,
  labelForOption,
  selectionIncludesOther,
} from "@/lib/onboarding/steps";
import {
  markOnboardingComplete,
  saveOnboardingDraft,
} from "@/lib/onboarding/onboarding-storage";
import { markWelcomePending } from "@/lib/onboarding/welcome-storage";
import { paths } from "@/routes";
import type { OnboardingData } from "@/types/onboarding";
import { EMPTY_ONBOARDING_DATA } from "@/types/onboarding";
import { OptionCard } from "./option-card";
import { OtherTextField } from "./other-text-field";

const fade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function toggleInList(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function OnboardingWizard() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData>(EMPTY_ONBOARDING_DATA);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = useMemo(() => getVisibleSteps(data), [data]);
  const stepId = steps[stepIndex] ?? "welcome";
  const canProceed = isStepValid(stepId, data);
  const progress = steps.length > 1 ? ((stepIndex + 1) / steps.length) * 100 : 100;
  const isIntro = stepId === "welcome";
  const isComplete = stepId === "complete";

  const patch = useCallback((partial: Partial<OnboardingData>) => {
    setData((prev) => {
      const next = { ...prev, ...partial };
      saveOnboardingDraft(next);
      return next;
    });
  }, []);

  const goNext = () => {
    if (!canProceed) return;
    if (stepIndex < steps.length - 1) {
      setStepIndex((i) => i + 1);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const finish = () => {
    markOnboardingComplete();
    saveOnboardingDraft(data);
    markWelcomePending();
    router.push(paths.platform.dashboard);
  };

  const toggleDepartment = (id: string) => {
    const next = toggleInList(data.departments, id);
    const headcount = { ...data.departmentHeadcount };
    if (!next.includes(id)) delete headcount[id];
    else if (headcount[id] === undefined) headcount[id] = 1;
    patch({ departments: next, departmentHeadcount: headcount });
  };

  const toggleDeliveryModel = (id: string) => {
    const next = toggleInList(data.deliveryModels, id);
    patch({
      deliveryModels: next,
      ...(next.includes("other") ? {} : { deliveryModelOther: "" }),
    });
  };

  const toggleTool = (id: string) => {
    const next = toggleInList(data.tools, id);
    patch({
      tools: next,
      ...(next.includes("other") ? {} : { toolsOther: "" }),
    });
  };

  const primaryLabel = isIntro
    ? "Empecemos"
    : isComplete
      ? "Entrar al panel"
      : "Siguiente";

  const handlePrimary = () => {
    if (isComplete) finish();
    else goNext();
  };

  const mainChallenge =
    CHALLENGE_OPTIONS.find((c) => data.challenges.includes(c.id))?.label ??
    data.challenges[0] ??
    "—";

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, hsl(var(--ai) / 0.2), transparent)",
        }}
      />

      {!isIntro && (
        <header className="relative z-10 shrink-0 border-b border-border/40 px-6 py-4">
          <div className="mx-auto flex max-w-3xl items-center gap-4">
            {!isComplete && (
              <button
                type="button"
                onClick={goBack}
                disabled={stepIndex === 0}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border border-border/60 transition-colors",
                  stepIndex === 0
                    ? "pointer-events-none opacity-30"
                    : "hover:bg-muted/40"
                )}
                aria-label="Atrás"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex justify-between text-2xs text-muted-foreground">
                <span>
                  Paso {stepIndex + 1} de {steps.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepId}
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="w-full max-w-xl"
          >
            {stepId === "welcome" && (
              <div className="space-y-8 text-center">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Configuremos tu espacio de trabajo
                </h1>
                <Text muted className="mx-auto max-w-md text-base leading-relaxed">
                  Toma unos 3 minutos. Usaremos esta información para personalizar cada
                  insight, métrica y recomendación a tu negocio específico.
                </Text>
              </div>
            )}

            {stepId === "businessName" && (
              <StepShell question="¿Cómo se llama tu negocio?">
                <Input
                  className="h-12 text-center text-lg"
                  placeholder="ej. Escala Academy"
                  value={data.businessName}
                  onChange={(e) => patch({ businessName: e.target.value })}
                  autoFocus
                />
              </StepShell>
            )}

            {stepId === "businessType" && (
              <StepShell question="¿Qué describe mejor tu negocio?">
                <div className="space-y-2">
                  {BUSINESS_TYPES.map((o) => (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      selected={data.businessType === o.id}
                      onClick={() =>
                        patch({
                          businessType: o.id,
                          ...(o.id !== "other" ? { businessTypeOther: "" } : {}),
                        })
                      }
                    />
                  ))}
                  <OtherTextField
                    visible={data.businessType === "other"}
                    value={data.businessTypeOther}
                    onChange={(v) => patch({ businessTypeOther: v })}
                    placeholder="Describe tu tipo de negocio"
                  />
                </div>
              </StepShell>
            )}

            {stepId === "revenueRange" && (
              <StepShell question="¿Cuál es tu facturación mensual actual?">
                <div className="space-y-2">
                  {REVENUE_RANGES.map((o) => (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      selected={data.revenueRange === o.id}
                      onClick={() => patch({ revenueRange: o.id })}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {stepId === "mainProduct" && (
              <StepShell question="¿Cuál es tu producto o servicio principal?">
                <textarea
                  className="min-h-[140px] w-full rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
                  placeholder="ej. Mentoría high ticket de 6 meses para coaches que quieren escalar a $50k/mes"
                  value={data.mainProduct}
                  onChange={(e) => patch({ mainProduct: e.target.value })}
                />
              </StepShell>
            )}

            {stepId === "teamSize" && (
              <StepShell question="¿Cuántas personas hay en tu equipo hoy?">
                <div className="space-y-2">
                  {TEAM_SIZES.map((o) => (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      selected={data.teamSize === o.id}
                      onClick={() => patch({ teamSize: o.id })}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {stepId === "departments" && (
              <StepShell question="¿Qué áreas o roles existen en tu equipo?">
                <div className="space-y-2">
                  {DEPARTMENT_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      selected={data.departments.includes(o.id)}
                      onClick={() => toggleDepartment(o.id)}
                      multi
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {stepId === "departmentHeadcount" && (
              <StepShell question="¿Cuántas personas trabajan en cada área?">
                <div className="space-y-4">
                  {data.departments.map((deptId) => {
                    const label =
                      DEPARTMENT_OPTIONS.find((d) => d.id === deptId)?.label ?? deptId;
                    return (
                      <div
                        key={deptId}
                        className="flex items-center justify-between gap-4 rounded-lg border border-border/50 px-4 py-3"
                      >
                        <span className="text-sm">{label}</span>
                        <Input
                          type="number"
                          min={1}
                          className="h-10 w-20 text-center"
                          value={data.departmentHeadcount[deptId] ?? ""}
                          onChange={(e) =>
                            patch({
                              departmentHeadcount: {
                                ...data.departmentHeadcount,
                                [deptId]: Number(e.target.value) || 0,
                              },
                            })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </StepShell>
            )}

            {stepId === "salesVolume" && (
              <StepShell question="¿Cuántas conversaciones de venta activas maneja tu equipo por día?">
                <div className="space-y-2">
                  {SALES_VOLUMES.map((o) => (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      selected={data.salesVolume === o.id}
                      onClick={() => patch({ salesVolume: o.id })}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {stepId === "bookingCapacity" && (
              <StepShell question="¿Cuántas llamadas de venta o agendamientos puede manejar tu equipo por semana?">
                <Input
                  type="number"
                  min={1}
                  className="mx-auto h-14 max-w-xs text-center text-2xl"
                  placeholder="ej. 20"
                  value={data.bookingCapacity}
                  onChange={(e) => patch({ bookingCapacity: e.target.value })}
                />
              </StepShell>
            )}

            {stepId === "deliveryModel" && (
              <StepShell question="¿Cómo entregas tu producto o servicio a los clientes?">
                <div className="space-y-2">
                  {DELIVERY_MODELS.map((o) => (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      selected={data.deliveryModels.includes(o.id)}
                      onClick={() => toggleDeliveryModel(o.id)}
                      multi
                    />
                  ))}
                  <OtherTextField
                    visible={selectionIncludesOther(data.deliveryModels)}
                    value={data.deliveryModelOther}
                    onChange={(v) => patch({ deliveryModelOther: v })}
                    placeholder="Describe cómo entregas tu producto o servicio"
                  />
                </div>
              </StepShell>
            )}

            {stepId === "onboardingProcess" && (
              <StepShell question="¿Tienes un proceso estructurado de onboarding para clientes nuevos?">
                <div className="space-y-2">
                  {ONBOARDING_PROCESS_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      selected={data.onboardingProcess === o.id}
                      onClick={() =>
                        patch({
                          onboardingProcess: o.id,
                          ...(o.id === "none" ? { onboardingCapacity: "" } : {}),
                        })
                      }
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {stepId === "onboardingCapacity" && (
              <StepShell question="¿Cuántos onboardings de clientes nuevos puede absorber tu equipo por semana sin convertirse en cuello de botella?">
                <Input
                  type="number"
                  min={1}
                  className="mx-auto h-14 max-w-xs text-center text-2xl"
                  placeholder="ej. 5"
                  value={data.onboardingCapacity}
                  onChange={(e) => patch({ onboardingCapacity: e.target.value })}
                />
              </StepShell>
            )}

            {stepId === "newClientsPerMonth" && (
              <StepShell question="¿Cuántos clientes nuevos incorporas normalmente por mes?">
                <Input
                  type="number"
                  min={0}
                  className="mx-auto h-14 max-w-xs text-center text-2xl"
                  placeholder="ej. 12"
                  value={data.newClientsPerMonth}
                  onChange={(e) => patch({ newClientsPerMonth: e.target.value })}
                />
              </StepShell>
            )}

            {stepId === "challenges" && (
              <StepShell question="¿Cuál es tu mayor desafío operativo ahora mismo?">
                <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
                  {CHALLENGE_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      selected={data.challenges.includes(o.id)}
                      onClick={() =>
                        patch({ challenges: toggleInList(data.challenges, o.id) })
                      }
                      multi
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {stepId === "tools" && (
              <StepShell question="¿Qué herramientas usa tu equipo actualmente?">
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {TOOL_OPTIONS.map((o) => (
                      <OptionCard
                        key={o.id}
                        label={o.label}
                        selected={data.tools.includes(o.id)}
                        onClick={() => toggleTool(o.id)}
                        multi
                      />
                    ))}
                  </div>
                  <OtherTextField
                    visible={selectionIncludesOther(data.tools)}
                    value={data.toolsOther}
                    onChange={(v) => patch({ toolsOther: v })}
                    placeholder="Indica qué otras herramientas usáis"
                  />
                </div>
              </StepShell>
            )}

            {stepId === "reportingFrequency" && (
              <StepShell question="¿Con qué frecuencia reporta tu equipo operaciones o resultados?">
                <div className="space-y-2">
                  {REPORTING_OPTIONS.map((o) => (
                    <OptionCard
                      key={o.id}
                      label={o.label}
                      selected={data.reportingFrequency === o.id}
                      onClick={() => patch({ reportingFrequency: o.id })}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {stepId === "complete" && (
              <div className="space-y-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                </motion.div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Tu espacio está listo
                </h1>
                <Text muted className="mx-auto max-w-md text-base leading-relaxed">
                  Configuramos la IA según el contexto de tu negocio. Cada insight, métrica
                  y recomendación se personalizará a cómo opera tu empresa.
                </Text>
                <GlassPanel className="mx-auto max-w-md p-5 text-left text-sm">
                  <dl className="space-y-2">
                    <SummaryRow label="Negocio" value={data.businessName} />
                    <SummaryRow
                      label="Tamaño del equipo"
                      value={labelForOption(TEAM_SIZES, data.teamSize)}
                    />
                    <SummaryRow
                      label="Facturación mensual"
                      value={labelForOption(REVENUE_RANGES, data.revenueRange)}
                    />
                    <SummaryRow label="Desafío principal" value={mainChallenge} />
                  </dl>
                </GlassPanel>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="relative z-10 shrink-0 border-t border-border/40 px-6 py-6">
        <div className="mx-auto flex max-w-xl justify-center">
          <Button
            size="lg"
            className="min-w-[200px]"
            disabled={!canProceed}
            onClick={handlePrimary}
          >
            {primaryLabel}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function StepShell({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <h2 className="text-center text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
        {question}
      </h2>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}

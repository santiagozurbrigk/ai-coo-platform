import type { OnboardingData, OnboardingProcess } from "@/types/onboarding";

export type StepId =
  | "welcome"
  | "businessName"
  | "businessType"
  | "revenueRange"
  | "mainProduct"
  | "teamSize"
  | "departments"
  | "departmentHeadcount"
  | "salesVolume"
  | "bookingCapacity"
  | "deliveryModel"
  | "onboardingProcess"
  | "onboardingCapacity"
  | "newClientsPerMonth"
  | "challenges"
  | "tools"
  | "reportingFrequency"
  | "complete";

export const STEP_ORDER: StepId[] = [
  "welcome",
  "businessName",
  "businessType",
  "revenueRange",
  "mainProduct",
  "teamSize",
  "departments",
  "departmentHeadcount",
  "salesVolume",
  "bookingCapacity",
  "deliveryModel",
  "onboardingProcess",
  "onboardingCapacity",
  "newClientsPerMonth",
  "challenges",
  "tools",
  "reportingFrequency",
  "complete",
];

export function showOnboardingCapacityStep(process: OnboardingProcess | null): boolean {
  return process === "defined" || process === "informal";
}

export function getVisibleSteps(data: OnboardingData): StepId[] {
  return STEP_ORDER.filter(
    (id) => id !== "onboardingCapacity" || showOnboardingCapacityStep(data.onboardingProcess)
  );
}

const OTHER_ID = "other";

export function selectionIncludesOther(selected: string | string[] | null): boolean {
  if (Array.isArray(selected)) return selected.includes(OTHER_ID);
  return selected === OTHER_ID;
}

export function isOtherTextFilled(text: string): boolean {
  return text.trim().length > 0;
}

export function isStepValid(id: StepId, data: OnboardingData): boolean {
  switch (id) {
    case "welcome":
    case "complete":
      return true;
    case "businessName":
      return data.businessName.trim().length > 0;
    case "businessType":
      return (
        Boolean(data.businessType) &&
        (!selectionIncludesOther(data.businessType) ||
          isOtherTextFilled(data.businessTypeOther))
      );
    case "revenueRange":
      return Boolean(data.revenueRange);
    case "mainProduct":
      return data.mainProduct.trim().length > 0;
    case "teamSize":
      return Boolean(data.teamSize);
    case "departments":
      return data.departments.length > 0;
    case "departmentHeadcount":
      return data.departments.every(
        (d) => (data.departmentHeadcount[d] ?? 0) > 0
      );
    case "salesVolume":
      return Boolean(data.salesVolume);
    case "bookingCapacity":
      return data.bookingCapacity.trim().length > 0 && Number(data.bookingCapacity) > 0;
    case "deliveryModel":
      return (
        data.deliveryModels.length > 0 &&
        (!selectionIncludesOther(data.deliveryModels) ||
          isOtherTextFilled(data.deliveryModelOther))
      );
    case "onboardingProcess":
      return Boolean(data.onboardingProcess);
    case "onboardingCapacity":
      return data.onboardingCapacity.trim().length > 0 && Number(data.onboardingCapacity) > 0;
    case "newClientsPerMonth":
      return data.newClientsPerMonth.trim().length > 0 && Number(data.newClientsPerMonth) >= 0;
    case "challenges":
      return data.challenges.length > 0;
    case "tools":
      return (
        data.tools.length > 0 &&
        (!selectionIncludesOther(data.tools) || isOtherTextFilled(data.toolsOther))
      );
    case "reportingFrequency":
      return Boolean(data.reportingFrequency);
    default:
      return false;
  }
}

export const BUSINESS_TYPES = [
  { id: "coaching", label: "Coaching / Mentoría" },
  { id: "education", label: "Educación online / Cursos" },
  { id: "consulting", label: "Consultoría" },
  { id: "agency", label: "Agencia" },
  { id: "community", label: "Comunidad" },
  { id: "creator", label: "Negocio de creator" },
  { id: "other", label: "Otro" },
] as const;

export const REVENUE_RANGES = [
  { id: "under-10k", label: "Menos de $10.000/mes" },
  { id: "10-30k", label: "$10.000 – $30.000/mes" },
  { id: "30-75k", label: "$30.000 – $75.000/mes" },
  { id: "75-150k", label: "$75.000 – $150.000/mes" },
  { id: "150-300k", label: "$150.000 – $300.000/mes" },
  { id: "300k-plus", label: "$300.000+/mes" },
] as const;

export const TEAM_SIZES = [
  { id: "solo", label: "Solo yo" },
  { id: "2-3", label: "2 – 3 personas" },
  { id: "4-7", label: "4 – 7 personas" },
  { id: "8-15", label: "8 – 15 personas" },
  { id: "15-plus", label: "15+ personas" },
] as const;

export const DEPARTMENT_OPTIONS = [
  { id: "sales", label: "Ventas / Setting" },
  { id: "delivery", label: "Delivery / Coaching" },
  { id: "operations", label: "Operaciones" },
  { id: "marketing", label: "Marketing / Contenido" },
  { id: "support", label: "Atención al cliente" },
  { id: "finance", label: "Finanzas / Admin" },
  { id: "tech", label: "Tecnología" },
] as const;

export const SALES_VOLUMES = [
  { id: "under-10", label: "Menos de 10" },
  { id: "10-30", label: "10 – 30" },
  { id: "30-60", label: "30 – 60" },
  { id: "60-100", label: "60 – 100" },
  { id: "100-plus", label: "100+" },
] as const;

export const DELIVERY_MODELS = [
  { id: "group", label: "Llamadas grupales / cohortes" },
  { id: "1on1", label: "Sesiones 1 a 1" },
  { id: "self-paced", label: "Autoguiado (sin delivery en vivo)" },
  { id: "community", label: "Comunidad + soporte async" },
  { id: "other", label: "Otro" },
] as const;

export const ONBOARDING_PROCESS_OPTIONS = [
  { id: "defined" as const, label: "Sí, está bien definido" },
  { id: "informal" as const, label: "Sí, pero es informal" },
  { id: "none" as const, label: "No, aún no tenemos uno" },
];

export const CHALLENGE_OPTIONS = [
  { id: "founder-bottleneck", label: "El equipo depende demasiado de mí (cuello de botella del fundador)" },
  { id: "no-sops", label: "Sin procesos o SOPs documentados" },
  { id: "inconsistent-sales", label: "Rendimiento de ventas inconsistente" },
  { id: "delivery-quality", label: "Calidad de delivery difícil de mantener a escala" },
  { id: "manual-reporting", label: "Reportes manuales o inexistentes" },
  { id: "scattered-knowledge", label: "Conocimiento disperso en herramientas" },
  { id: "hiring", label: "Contratar e integrar nuevos miembros" },
  { id: "no-visibility", label: "Sin visibilidad de lo que ocurre" },
] as const;

export const TOOL_OPTIONS = [
  { id: "manychat", label: "ManyChat" },
  { id: "notion", label: "Notion" },
  { id: "airtable", label: "Airtable" },
  { id: "google", label: "Google Docs / Drive" },
  { id: "fathom", label: "Fathom" },
  { id: "loom", label: "Loom" },
  { id: "slack", label: "Slack" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "other", label: "Otro" },
] as const;

export const REPORTING_OPTIONS = [
  { id: "daily", label: "Diario" },
  { id: "weekly", label: "Semanal" },
  { id: "monthly", label: "Mensual" },
  { id: "rarely", label: "Rara vez o nunca" },
] as const;

export function labelForOption(
  options: readonly { id: string; label: string }[],
  id: string | null
): string {
  return options.find((o) => o.id === id)?.label ?? "—";
}

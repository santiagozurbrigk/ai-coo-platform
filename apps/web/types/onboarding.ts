export type OnboardingProcess = "defined" | "informal" | "none";

export type OnboardingData = {
  businessName: string;
  businessType: string | null;
  businessTypeOther: string;
  revenueRange: string | null;
  mainProduct: string;
  teamSize: string | null;
  departments: string[];
  departmentHeadcount: Record<string, number>;
  salesVolume: string | null;
  bookingCapacity: string;
  deliveryModels: string[];
  deliveryModelOther: string;
  onboardingProcess: OnboardingProcess | null;
  onboardingCapacity: string;
  newClientsPerMonth: string;
  challenges: string[];
  tools: string[];
  toolsOther: string;
  reportingFrequency: string | null;
};

export const EMPTY_ONBOARDING_DATA: OnboardingData = {
  businessName: "",
  businessType: null,
  businessTypeOther: "",
  revenueRange: null,
  mainProduct: "",
  teamSize: null,
  departments: [],
  departmentHeadcount: {},
  salesVolume: null,
  bookingCapacity: "",
  deliveryModels: [],
  deliveryModelOther: "",
  onboardingProcess: null,
  onboardingCapacity: "",
  newClientsPerMonth: "",
  challenges: [],
  tools: [],
  toolsOther: "",
  reportingFrequency: null,
};

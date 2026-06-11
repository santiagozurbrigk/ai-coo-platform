import type { SopStatus } from "@ai-coo/types";
import type { Department } from "./operations";

export type SopDepartment = Department | "marketing" | "general";

export type Sop = {
  id: string;
  title: string;
  department: SopDepartment;
  status: SopStatus;
  lastUpdated: string;
  goal: string;
};

export type SopCreatorForm = {
  goal: string;
  department: SopDepartment;
  expectedOutcome: string;
  additionalContext: string;
};

export type GeneratedSopSection = {
  title: string;
  items: string[];
};

export type GeneratedSop = {
  title: string;
  sections: GeneratedSopSection[];
};

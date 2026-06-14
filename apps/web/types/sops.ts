import type { SopStatus } from "@ai-coo/types";
import type { Department } from "./operations";

export type SopDepartment = Department | "marketing" | "general" | "finance";

export type Sop = {
  id: string;
  title: string;
  department: SopDepartment;
  status: SopStatus;
  lastUpdated: string;
  goal: string;
  generatedByAI?: boolean;
  estimatedDurationMinutes?: number;
  version?: number;
  tags?: string[];
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
  summary?: string;
  content: string;
  tags: string[];
  estimatedDurationMinutes?: number;
  stepsCount?: number;
  /** @deprecated Solo mocks legacy */
  sections?: GeneratedSopSection[];
};

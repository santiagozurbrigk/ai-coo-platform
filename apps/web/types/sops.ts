import type { SopStatus } from "@ai-coo/types";
import type { Department } from "./operations";

export type Sop = {
  id: string;
  title: string;
  department: Department | "general";
  status: SopStatus;
  lastUpdated: string;
  goal: string;
};

export type SopCreatorForm = {
  goal: string;
  department: string;
  expectedOutcome: string;
  additionalContext: string;
};

export type WeeklyInputType = "text" | "audio" | "form";

export type Department = "sales" | "delivery" | "operations" | "founder";

export type InputImportance = "high" | "medium" | "low";

export type TeamInput = {
  id: string;
  department: Department;
  type: WeeklyInputType;
  importance: InputImportance;
  author: string;
  submittedAt: string;
  preview: string;
};

/** @deprecated Use TeamInput */
export type WeeklyInput = TeamInput;

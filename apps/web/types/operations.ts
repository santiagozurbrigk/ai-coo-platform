export type WeeklyInputType = "text" | "audio" | "form";

export type Department = "sales" | "delivery" | "operations" | "founder";

export type WeeklyInput = {
  id: string;
  department: Department;
  type: WeeklyInputType;
  author: string;
  submittedAt: string;
  preview: string;
};

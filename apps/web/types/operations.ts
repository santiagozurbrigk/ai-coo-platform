export type WeeklyInputType = "text" | "rating" | "audio" | "form";

export type Department =
  | "sales"
  | "delivery"
  | "operations"
  | "marketing"
  | "founder";

export type InputImportance = "high" | "medium" | "low";

export type TeamInput = {
  id: string;
  department: Department;
  type: WeeklyInputType;
  importance: InputImportance;
  author: string;
  submittedAt: string;
  preview: string;
  rating?: number;
};

/** @deprecated Use TeamInput */
export type WeeklyInput = TeamInput;

export type WeeklyReportStatus =
  | "pending"
  | "generating"
  | "ready"
  | "error";

export type WeeklyInputRow = {
  id: string;
  organization_id: string;
  week_start: string;
  department: string;
  type: WeeklyInputType;
  content: string | null;
  rating: number | null;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
};

export type WeeklyReportRow = {
  id: string;
  organization_id: string;
  week_start: string;
  executive_summary: string | null;
  risks: unknown;
  bottlenecks: unknown;
  recommendations: unknown;
  generated_at: string | null;
  status: WeeklyReportStatus;
  created_at: string;
};

export type WeeklyReportJson = {
  executive_summary: string;
  risks: Array<{
    title: string;
    description: string;
    level: "high" | "medium" | "low";
  }>;
  bottlenecks: Array<{ area: string; description: string }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
};

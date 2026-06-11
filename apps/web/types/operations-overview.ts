export type OperationsRiskLevel = "high" | "medium" | "low";

export type OperationsArea =
  | "sales"
  | "delivery"
  | "operations"
  | "marketing";

export type OperationsRisk = {
  id: string;
  title: string;
  description: string;
  level: OperationsRiskLevel;
  suggestedAction: string;
};

export type OperationsBottleneck = {
  id: string;
  department: OperationsArea;
  title: string;
  description: string;
  impact: OperationsRiskLevel;
};

export type OperationsDepartmentStatus = "healthy" | "warning" | "critical";

export type OperationsDepartment = {
  id: string;
  area: OperationsArea;
  name: string;
  status: OperationsDepartmentStatus;
  statusLabel: string;
  metrics: {
    label: string;
    value: string;
    trend?: "up" | "down" | "neutral";
  }[];
};

export type OperationsRecommendation = {
  id: string;
  title: string;
  description: string;
  priority: OperationsRiskLevel;
  department: string;
};

export type OperationsOverviewData = {
  executiveReport: string[];
  risks: OperationsRisk[];
  bottlenecks: OperationsBottleneck[];
  departments: OperationsDepartment[];
  recommendations: OperationsRecommendation[];
};

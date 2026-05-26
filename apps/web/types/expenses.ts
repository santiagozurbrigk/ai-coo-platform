export type ExpenseCategory =
  | "infrastructure"
  | "professional"
  | "marketing"
  | "tools"
  | "other";

export type ExpenseStatus = "active" | "paused";

export type FixedExpense = {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  frequency: "monthly" | "annual";
  status: ExpenseStatus;
};

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: "monthly" | "annual";
  icon?: string;
};

export type CommissionBasis =
  | "per_deal"
  | "monthly_revenue"
  | "upsells"
  | "custom";

export type TeamCompensation = {
  id: string;
  memberId: string;
  memberName: string;
  roleLabel: string;
  hasFixed: boolean;
  fixedMonthly?: number;
  hasCommission: boolean;
  commissionPercent?: number;
  commissionBasis?: CommissionBasis;
  commissionSummary?: string;
  notes?: string;
  estimatedThisMonth: number;
};

export type ExpensesSummary = {
  fixedMonthly: number;
  subscriptionsMonthly: number;
  teamFixedMonthly: number;
  teamCommissionsMonthly: number;
  totalMonthly: number;
};

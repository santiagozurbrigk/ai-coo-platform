import type {
  ExpensesSummary,
  FixedExpense,
  Subscription,
  TeamCompensation,
} from "@/types/expenses";
import { mockTeamMembers } from "@/mocks/team";

export const mockFixedExpenses: FixedExpense[] = [
  {
    id: "fe1",
    name: "Contador",
    category: "professional",
    amount: 300,
    currency: "USD",
    frequency: "monthly",
    status: "active",
  },
  {
    id: "fe2",
    name: "Hosting servidores",
    category: "infrastructure",
    amount: 80,
    currency: "USD",
    frequency: "monthly",
    status: "active",
  },
  {
    id: "fe3",
    name: "Insumos oficina",
    category: "other",
    amount: 50,
    currency: "USD",
    frequency: "monthly",
    status: "active",
  },
];

export const mockSubscriptions: Subscription[] = [
  { id: "sub1", name: "Notion", amount: 16, currency: "USD", billingCycle: "monthly" },
  { id: "sub2", name: "Zoom", amount: 15, currency: "USD", billingCycle: "monthly" },
  { id: "sub3", name: "Fathom", amount: 29, currency: "USD", billingCycle: "monthly" },
  {
    id: "sub4",
    name: "Google Workspace",
    amount: 12,
    currency: "USD",
    billingCycle: "monthly",
  },
  { id: "sub5", name: "Calendly", amount: 12, currency: "USD", billingCycle: "monthly" },
  { id: "sub6", name: "Make", amount: 16, currency: "USD", billingCycle: "monthly" },
  {
    id: "sub7",
    name: "Este software",
    amount: 0,
    currency: "USD",
    billingCycle: "monthly",
  },
];

export const mockTeamCompensation: TeamCompensation[] = [
  {
    id: "tc1",
    memberId: "u-closer-1",
    memberName: "Martín López",
    roleLabel: "Closer",
    hasFixed: false,
    hasCommission: true,
    commissionPercent: 10,
    commissionBasis: "per_deal",
    commissionSummary: "10% por deal cerrado",
    estimatedThisMonth: 2400,
  },
  {
    id: "tc2",
    memberId: "u-closer-2",
    memberName: "Diego Fernández",
    roleLabel: "Closer",
    hasFixed: false,
    hasCommission: true,
    commissionPercent: 10,
    commissionBasis: "per_deal",
    commissionSummary: "10% por deal cerrado",
    estimatedThisMonth: 1500,
  },
  {
    id: "tc3",
    memberId: "u-csm-1",
    memberName: "Ana Gómez",
    roleLabel: "CSM",
    hasFixed: true,
    fixedMonthly: 800,
    hasCommission: true,
    commissionPercent: 5,
    commissionBasis: "upsells",
    commissionSummary: "5% de upsells",
    estimatedThisMonth: 900,
  },
  {
    id: "tc4",
    memberId: "u-op-1",
    memberName: "Roberto Sánchez",
    roleLabel: "Operador",
    hasFixed: true,
    fixedMonthly: 600,
    hasCommission: false,
    estimatedThisMonth: 600,
  },
  {
    id: "tc5",
    memberId: "u-set-1",
    memberName: "Laura Méndez",
    roleLabel: "Setter",
    hasFixed: true,
    fixedMonthly: 400,
    hasCommission: true,
    commissionPercent: 2,
    commissionBasis: "per_deal",
    commissionSummary: "2% de deals agendados que cierran",
    estimatedThisMonth: 1180,
  },
];

/** Miembros extra para selects de compensación (Fase 0) */
export const mockCompensationMembers = [
  ...mockTeamMembers,
  { id: "u-closer-1", name: "Martín López", email: "martin@acme.co", role: "operator" as const, status: "active" as const, lastLogin: "2026-05-21T08:00:00Z" },
  { id: "u-closer-2", name: "Diego Fernández", email: "diego@acme.co", role: "operator" as const, status: "active" as const, lastLogin: "2026-05-21T08:00:00Z" },
  { id: "u-csm-1", name: "Ana Gómez", email: "ana@acme.co", role: "operator" as const, status: "active" as const, lastLogin: "2026-05-20T18:00:00Z" },
  { id: "u-op-1", name: "Roberto Sánchez", email: "roberto@acme.co", role: "operator" as const, status: "active" as const, lastLogin: "2026-05-18T10:00:00Z" },
  { id: "u-set-1", name: "Laura Méndez", email: "laura.setter@acme.co", role: "operator" as const, status: "active" as const, lastLogin: "2026-05-19T16:00:00Z" },
];

export const mockExpensesSummary: ExpensesSummary = {
  fixedMonthly: 430,
  subscriptionsMonthly: 100,
  teamFixedMonthly: 1800,
  teamCommissionsMonthly: 5980,
  totalMonthly: 8310,
};

/** Ajuste visual alineado con Finanzas mock (gastos totales 11.360) */
export const mockExpensesSummaryDisplay: ExpensesSummary = {
  fixedMonthly: 430,
  subscriptionsMonthly: 100,
  teamFixedMonthly: 1800,
  teamCommissionsMonthly: 9030,
  totalMonthly: 11360,
};

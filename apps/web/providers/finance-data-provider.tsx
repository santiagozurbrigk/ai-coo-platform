"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  mockExpensesSummaryDisplay,
  mockFixedExpenses,
  mockSubscriptions,
  mockTeamCompensation,
} from "@/mocks/expenses";
import {
  mockFinanceSummary,
  mockMonthlySeries,
  mockPaymentPlatforms,
} from "@/mocks/finance";
import type {
  ExpensesSummary,
  FixedExpense,
  Subscription,
  TeamCompensation,
} from "@/types/expenses";
import type { FinanceSummary, PaymentPlatformConfig } from "@/types/finance";

type FinanceDataContextValue = {
  paymentPlatforms: PaymentPlatformConfig[];
  addPaymentPlatform: (platform: Omit<PaymentPlatformConfig, "id" | "totalReceived" | "lastTransactionAt">) => void;
  updatePaymentPlatform: (id: string, patch: Partial<PaymentPlatformConfig>) => void;
  removePaymentPlatform: (id: string) => void;
  financeSummary: FinanceSummary;
  monthlySeries: typeof mockMonthlySeries;
  fixedExpenses: FixedExpense[];
  subscriptions: Subscription[];
  teamCompensation: TeamCompensation[];
  expensesSummary: ExpensesSummary;
  addFixedExpense: (expense: Omit<FixedExpense, "id">) => void;
  updateFixedExpense: (id: string, patch: Partial<FixedExpense>) => void;
  removeFixedExpense: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, "id">) => void;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
  updateTeamCompensation: (id: string, patch: Partial<TeamCompensation>) => void;
};

const FinanceDataContext = createContext<FinanceDataContextValue | null>(null);

function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function FinanceDataProvider({ children }: { children: ReactNode }) {
  const [paymentPlatforms, setPaymentPlatforms] = useState<PaymentPlatformConfig[]>(
    () => mockPaymentPlatforms.map((p) => ({ ...p }))
  );
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(
    () => mockFixedExpenses.map((e) => ({ ...e }))
  );
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    () => mockSubscriptions.map((s) => ({ ...s }))
  );
  const [teamCompensation, setTeamCompensation] = useState<TeamCompensation[]>(
    () => mockTeamCompensation.map((t) => ({ ...t }))
  );

  const addPaymentPlatform = useCallback(
    (platform: Omit<PaymentPlatformConfig, "id" | "totalReceived" | "lastTransactionAt">) => {
      setPaymentPlatforms((prev) => [
        ...prev,
        {
          ...platform,
          id: newId("pp"),
          totalReceived: 0,
          lastTransactionAt: new Date().toISOString().slice(0, 10),
        },
      ]);
    },
    []
  );

  const updatePaymentPlatform = useCallback(
    (id: string, patch: Partial<PaymentPlatformConfig>) => {
      setPaymentPlatforms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    },
    []
  );

  const removePaymentPlatform = useCallback((id: string) => {
    setPaymentPlatforms((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addFixedExpense = useCallback((expense: Omit<FixedExpense, "id">) => {
    setFixedExpenses((prev) => [...prev, { ...expense, id: newId("fe") }]);
  }, []);

  const updateFixedExpense = useCallback((id: string, patch: Partial<FixedExpense>) => {
    setFixedExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
  }, []);

  const removeFixedExpense = useCallback((id: string) => {
    setFixedExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addSubscription = useCallback((sub: Omit<Subscription, "id">) => {
    setSubscriptions((prev) => [...prev, { ...sub, id: newId("sub") }]);
  }, []);

  const updateSubscription = useCallback((id: string, patch: Partial<Subscription>) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }, []);

  const removeSubscription = useCallback((id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const updateTeamCompensation = useCallback(
    (id: string, patch: Partial<TeamCompensation>) => {
      setTeamCompensation((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
    },
    []
  );

  const value = useMemo(
    () => ({
      paymentPlatforms,
      addPaymentPlatform,
      updatePaymentPlatform,
      removePaymentPlatform,
      financeSummary: mockFinanceSummary,
      monthlySeries: mockMonthlySeries,
      fixedExpenses,
      subscriptions,
      teamCompensation,
      expensesSummary: mockExpensesSummaryDisplay,
      addFixedExpense,
      updateFixedExpense,
      removeFixedExpense,
      addSubscription,
      updateSubscription,
      removeSubscription,
      updateTeamCompensation,
    }),
    [
      paymentPlatforms,
      addPaymentPlatform,
      updatePaymentPlatform,
      removePaymentPlatform,
      fixedExpenses,
      subscriptions,
      teamCompensation,
      addFixedExpense,
      updateFixedExpense,
      removeFixedExpense,
      addSubscription,
      updateSubscription,
      removeSubscription,
      updateTeamCompensation,
    ]
  );

  return (
    <FinanceDataContext.Provider value={value}>{children}</FinanceDataContext.Provider>
  );
}

export function useFinanceData(): FinanceDataContextValue {
  const ctx = useContext(FinanceDataContext);
  if (!ctx) {
    throw new Error("useFinanceData debe usarse dentro de FinanceDataProvider");
  }
  return ctx;
}

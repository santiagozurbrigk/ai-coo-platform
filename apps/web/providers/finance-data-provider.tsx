"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createFixedExpenseAction,
  createPaymentPlatformAction,
  createSubscriptionAction,
  deleteFixedExpenseAction,
  deletePaymentPlatformAction,
  deleteSubscriptionAction,
  loadFinanceConfigAction,
  updateFixedExpenseAction,
  updatePaymentPlatformAction,
  updateSubscriptionAction,
  updateTeamCompensationAction,
} from "@/app/finance/actions";
import {
  mockFinanceSummary,
  mockMonthlySeries,
} from "@/mocks/finance";
import { computeExpensesSummary } from "@/lib/metrics/compute-expenses-summary";
import { deriveFinanceSummary } from "@/lib/metrics/derive-finance-summary";
import { deriveMonthlySeries } from "@/lib/metrics/derive-monthly-series";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { usePlatformData } from "@/providers/platform-data-provider";
import type {
  ExpensesSummary,
  FixedExpense,
  Subscription,
  TeamCompensation,
} from "@/types/expenses";
import type { FinanceSummary, PaymentPlatformConfig } from "@/types/finance";

const useSupabase = isSupabaseConfigured();

type FinanceDataContextValue = {
  paymentPlatforms: PaymentPlatformConfig[];
  financeConfigLoading: boolean;
  addPaymentPlatform: (
    platform: Omit<PaymentPlatformConfig, "id" | "totalReceived" | "lastTransactionAt">
  ) => Promise<string | undefined>;
  updatePaymentPlatform: (
    id: string,
    patch: Partial<PaymentPlatformConfig>
  ) => Promise<string | undefined>;
  removePaymentPlatform: (id: string) => Promise<string | undefined>;
  financeSummary: FinanceSummary;
  monthlySeries: typeof mockMonthlySeries;
  fixedExpenses: FixedExpense[];
  subscriptions: Subscription[];
  teamCompensation: TeamCompensation[];
  expensesSummary: ExpensesSummary;
  addFixedExpense: (expense: Omit<FixedExpense, "id">) => Promise<string | undefined>;
  updateFixedExpense: (
    id: string,
    patch: Partial<FixedExpense>
  ) => Promise<string | undefined>;
  removeFixedExpense: (id: string) => Promise<string | undefined>;
  addSubscription: (sub: Omit<Subscription, "id">) => Promise<string | undefined>;
  updateSubscription: (
    id: string,
    patch: Partial<Subscription>
  ) => Promise<string | undefined>;
  removeSubscription: (id: string) => Promise<string | undefined>;
  updateTeamCompensation: (
    id: string,
    patch: Partial<TeamCompensation>
  ) => Promise<string | undefined>;
  refreshFinanceConfig: () => Promise<void>;
};

const FinanceDataContext = createContext<FinanceDataContextValue | null>(null);

export function FinanceDataProvider({ children }: { children: ReactNode }) {
  const { clients, closingCalls, clientsLoading, closingCallsLoading } =
    usePlatformData();

  const [financeConfigLoading, setFinanceConfigLoading] = useState(useSupabase);
  const [paymentPlatforms, setPaymentPlatforms] = useState<PaymentPlatformConfig[]>(
    []
  );
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [teamCompensation, setTeamCompensation] = useState<TeamCompensation[]>([]);

  const refreshFinanceConfig = useCallback(async () => {
    if (!useSupabase) return;
    setFinanceConfigLoading(true);
    try {
      const config = await loadFinanceConfigAction();
      setPaymentPlatforms(config.paymentPlatforms);
      setFixedExpenses(config.fixedExpenses);
      setSubscriptions(config.subscriptions);
      setTeamCompensation(config.teamCompensation);
    } catch (e) {
      console.error("[FinanceDataProvider] loadFinanceConfig", e);
    } finally {
      setFinanceConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    if (useSupabase) {
      void refreshFinanceConfig();
    } else {
      void loadFinanceConfigAction().then((config) => {
        setPaymentPlatforms(config.paymentPlatforms);
        setFixedExpenses(config.fixedExpenses);
        setSubscriptions(config.subscriptions);
        setTeamCompensation(config.teamCompensation);
      });
    }
  }, [refreshFinanceConfig]);

  const runFinanceMutation = useCallback(
    async (result: { success: boolean; error?: string }) => {
      if (!result.success) return result.error ?? "Error al guardar";
      await refreshFinanceConfig();
      return undefined;
    },
    [refreshFinanceConfig]
  );

  const addPaymentPlatform = useCallback(
    async (
      platform: Omit<
        PaymentPlatformConfig,
        "id" | "totalReceived" | "lastTransactionAt"
      >
    ) => {
      if (useSupabase) {
        return runFinanceMutation(await createPaymentPlatformAction(platform));
      }
      setPaymentPlatforms((prev) => [
        ...prev,
        {
          ...platform,
          id: `pp-${Date.now()}`,
          totalReceived: 0,
          lastTransactionAt: new Date().toISOString().slice(0, 10),
        },
      ]);
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const updatePaymentPlatform = useCallback(
    async (id: string, patch: Partial<PaymentPlatformConfig>) => {
      if (useSupabase) {
        return runFinanceMutation(await updatePaymentPlatformAction(id, patch));
      }
      setPaymentPlatforms((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const removePaymentPlatform = useCallback(
    async (id: string) => {
      if (useSupabase) {
        return runFinanceMutation(await deletePaymentPlatformAction(id));
      }
      setPaymentPlatforms((prev) => prev.filter((p) => p.id !== id));
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const addFixedExpense = useCallback(
    async (expense: Omit<FixedExpense, "id">) => {
      if (useSupabase) {
        return runFinanceMutation(await createFixedExpenseAction(expense));
      }
      setFixedExpenses((prev) => [
        ...prev,
        { ...expense, id: `fe-${Date.now()}` },
      ]);
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const updateFixedExpense = useCallback(
    async (id: string, patch: Partial<FixedExpense>) => {
      if (useSupabase) {
        return runFinanceMutation(await updateFixedExpenseAction(id, patch));
      }
      setFixedExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
      );
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const removeFixedExpense = useCallback(
    async (id: string) => {
      if (useSupabase) {
        return runFinanceMutation(await deleteFixedExpenseAction(id));
      }
      setFixedExpenses((prev) => prev.filter((e) => e.id !== id));
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const addSubscription = useCallback(
    async (sub: Omit<Subscription, "id">) => {
      if (useSupabase) {
        return runFinanceMutation(await createSubscriptionAction(sub));
      }
      setSubscriptions((prev) => [...prev, { ...sub, id: `sub-${Date.now()}` }]);
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const updateSubscription = useCallback(
    async (id: string, patch: Partial<Subscription>) => {
      if (useSupabase) {
        return runFinanceMutation(await updateSubscriptionAction(id, patch));
      }
      setSubscriptions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
      );
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const removeSubscription = useCallback(
    async (id: string) => {
      if (useSupabase) {
        return runFinanceMutation(await deleteSubscriptionAction(id));
      }
      setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const updateTeamCompensation = useCallback(
    async (id: string, patch: Partial<TeamCompensation>) => {
      if (useSupabase) {
        return runFinanceMutation(await updateTeamCompensationAction(id, patch));
      }
      setTeamCompensation((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
      );
      return undefined;
    },
    [refreshFinanceConfig, runFinanceMutation]
  );

  const expensesSummary = useMemo(
    () =>
      computeExpensesSummary(fixedExpenses, subscriptions, teamCompensation),
    [fixedExpenses, subscriptions, teamCompensation]
  );

  const dataReady =
    !useSupabase || (!clientsLoading && !closingCallsLoading && !financeConfigLoading);

  const financeSummary: FinanceSummary = useMemo(() => {
    if (!useSupabase) return mockFinanceSummary;
    const sourceClients = dataReady ? clients : [];
    const sourceCalls = dataReady ? closingCalls : [];
    return deriveFinanceSummary(
      sourceClients,
      sourceCalls,
      expensesSummary,
      paymentPlatforms
    );
  }, [
    clients,
    closingCalls,
    expensesSummary,
    paymentPlatforms,
    dataReady,
  ]);

  const monthlySeries = useMemo(() => {
    if (!useSupabase) return mockMonthlySeries;
    const sourceClients = dataReady ? clients : [];
    return deriveMonthlySeries(sourceClients, expensesSummary);
  }, [clients, expensesSummary, dataReady]);

  const value = useMemo(
    () => ({
      paymentPlatforms,
      financeConfigLoading,
      addPaymentPlatform,
      updatePaymentPlatform,
      removePaymentPlatform,
      financeSummary,
      monthlySeries,
      fixedExpenses,
      subscriptions,
      teamCompensation,
      expensesSummary,
      addFixedExpense,
      updateFixedExpense,
      removeFixedExpense,
      addSubscription,
      updateSubscription,
      removeSubscription,
      updateTeamCompensation,
      refreshFinanceConfig,
    }),
    [
      paymentPlatforms,
      financeConfigLoading,
      addPaymentPlatform,
      updatePaymentPlatform,
      removePaymentPlatform,
      financeSummary,
      monthlySeries,
      fixedExpenses,
      subscriptions,
      teamCompensation,
      expensesSummary,
      addFixedExpense,
      updateFixedExpense,
      removeFixedExpense,
      addSubscription,
      updateSubscription,
      removeSubscription,
      updateTeamCompensation,
      refreshFinanceConfig,
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

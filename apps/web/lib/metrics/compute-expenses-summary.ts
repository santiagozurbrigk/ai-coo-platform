import type {
  ExpensesSummary,
  FixedExpense,
  Subscription,
  TeamCompensation,
} from "@/types/expenses";

/** Gastos mensuales desde la configuración de Gastos (DB o mock). */
export function computeExpensesSummary(
  fixedExpenses: FixedExpense[],
  subscriptions: Subscription[],
  teamCompensation: TeamCompensation[]
): ExpensesSummary {
  const fixedMonthly = fixedExpenses
    .filter((e) => e.status === "active" && e.frequency === "monthly")
    .reduce((sum, e) => sum + e.amount, 0);

  const subscriptionsMonthly = subscriptions
    .filter((s) => s.billingCycle === "monthly")
    .reduce((sum, s) => sum + s.amount, 0);
  // Suscripciones pausadas no se cargan desde DB (filtro en listado).

  const teamFixedMonthly = teamCompensation.reduce(
    (sum, t) => sum + (t.hasFixed ? (t.fixedMonthly ?? 0) : 0),
    0
  );

  const teamCommissionsMonthly = teamCompensation.reduce((sum, t) => {
    if (!t.hasCommission) return sum;
    const estimated = t.estimatedThisMonth ?? 0;
    const fixed = t.hasFixed ? (t.fixedMonthly ?? 0) : 0;
    return sum + Math.max(0, estimated - fixed);
  }, 0);

  const totalMonthly =
    fixedMonthly +
    subscriptionsMonthly +
    teamFixedMonthly +
    teamCommissionsMonthly;

  return {
    fixedMonthly,
    subscriptionsMonthly,
    teamFixedMonthly,
    teamCommissionsMonthly,
    totalMonthly,
  };
}

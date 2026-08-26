import type { ClosingCall } from "@/types/closing";
import type { TeamCompensation } from "@/types/expenses";

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function isInCurrentMonth(iso: string): boolean {
  // Comparar YYYY-MM como string evita el bug UTC-midnight de new Date("YYYY-MM-DD")
  // que en zonas UTC-N reporta el mes anterior para timestamps al inicio del mes.
  const dYearMonth = iso.slice(0, 7);
  const now = new Date();
  const nowYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return dYearMonth === nowYearMonth;
}

/** Estima comisiones del mes desde closing_calls cerradas (por nombre del closer). */
export function enrichTeamCompensationWithCommissions(
  team: TeamCompensation[],
  closingCalls: ClosingCall[]
): TeamCompensation[] {
  const closedThisMonth = closingCalls.filter(
    (c) =>
      c.status === "closed" &&
      c.outcome?.revenue != null &&
      c.outcome.revenue > 0 &&
      isInCurrentMonth(c.scheduledAt)
  );

  return team.map((member) => {
    const fixed = member.hasFixed ? (member.fixedMonthly ?? 0) : 0;
    let commission = 0;

    if (member.hasCommission && member.commissionPercent != null) {
      const rate = member.commissionPercent / 100;
      const memberKey = normalizeName(member.memberName);

      if (
        member.commissionBasis === "per_deal" ||
        member.commissionBasis === "custom" ||
        !member.commissionBasis
      ) {
        for (const call of closedThisMonth) {
          const closer = normalizeName(call.closedByName ?? "");
          if (closer && closer === memberKey) {
            commission += (call.outcome?.revenue ?? 0) * rate;
          }
        }
      }
    }

    return {
      ...member,
      estimatedThisMonth: Math.round(fixed + commission),
    };
  });
}

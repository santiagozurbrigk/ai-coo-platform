import { describe, expect, it } from "vitest";
import { newClientFromOnboarding } from "@/lib/client-onboarding/assign";

describe("newClientFromOnboarding", () => {
  it("crea un cliente pendiente de onboarding, sin facturación inventada", () => {
    expect(
      newClientFromOnboarding("org", "  Martín  ", new Date("2026-09-23T15:00:00Z"))
    ).toEqual({
      organization_id: "org",
      name: "Martín",
      join_date: "2026-09-23",
      payment_type: "upfront",
      platform: "bank_transfer",
      total_amount: 0,
      status: "pending_onboarding",
    });
  });
});

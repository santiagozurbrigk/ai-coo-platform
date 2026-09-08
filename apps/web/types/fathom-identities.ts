/** B · L2 — Las identidades con las que se reconoce a la contraparte. */

export const IDENTITY_TYPES = ["email", "speaker_alias", "name", "phone"] as const;
export type IdentityType = (typeof IDENTITY_TYPES)[number];

export const IDENTITY_SOURCES = [
  "seed",
  "manual_confirmation",
  "calendar",
  "payment",
  "ghl",
  "discord",
] as const;
export type IdentitySource = (typeof IDENTITY_SOURCES)[number];

export type ClientIdentity = {
  id: string;
  organizationId: string;
  /** Uno de los dos, nunca los dos. */
  clientId: string | null;
  leadId: string | null;
  identityType: IdentityType;
  value: string;
  normalizedValue: string;
  source: IdentitySource;
  timesMatched: number;
  lastMatchedAt: string | null;
};

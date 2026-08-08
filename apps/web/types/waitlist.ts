export type WaitlistLead = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  instagram: string | null;
  monthlyRevenue: string | null;
  teamSize: string | null;
  operationalPain: string | null;
  whyNow: string | null;
  source: string;
  calendlyEventUrl: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  createdAt: string;
};

export const MONTHLY_REVENUE_OPTIONS = [
  "Menos de $3.000 USD",
  "$3.000 – $10.000 USD",
  "$10.000 – $30.000 USD",
  "Más de $30.000 USD",
] as const;

export const TEAM_SIZE_OPTIONS = [
  "Solo yo",
  "2 – 5 personas",
  "6 – 15 personas",
  "Más de 15",
] as const;

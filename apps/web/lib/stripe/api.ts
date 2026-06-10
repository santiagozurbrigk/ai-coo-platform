import { getStripeClient } from "./config";

export type StripeBalanceAmount = {
  amount: number;
  currency: string;
};

export type StripeBalance = {
  available: StripeBalanceAmount[];
  pending: StripeBalanceAmount[];
};

export type StripeBalanceTransaction = {
  id: string;
  amount: number;
  currency: string;
  net: number;
  fee: number;
  type: string;
  status: string;
  description: string | null;
  created: number;
  source?: {
    id?: string;
    object?: string;
    billing_details?: { email?: string | null };
    receipt_email?: string | null;
    description?: string | null;
    metadata?: Record<string, string>;
  } | null;
};

export type StripeListResponse<T> = {
  data: T[];
  has_more: boolean;
};

async function stripeFetch<T>(accessToken: string, path: string): Promise<T> {
  const client = getStripeClient(accessToken);
  const res = await fetch(`${client.baseUrl}${path}`, {
    headers: client.headers,
  });
  const json = (await res.json().catch(() => ({}))) as T & {
    error?: { message?: string };
  };
  if (!res.ok) {
    throw new Error(json.error?.message ?? `Stripe API error (${res.status})`);
  }
  return json;
}

export async function getStripeBalance(
  accessToken: string
): Promise<StripeBalance> {
  return stripeFetch<StripeBalance>(accessToken, "/balance");
}

export async function getStripeTransactions(
  accessToken: string,
  limit = 50,
  startingAfter?: string
): Promise<StripeListResponse<StripeBalanceTransaction>> {
  const params = new URLSearchParams({
    limit: String(limit),
    "expand[]": "data.source",
  });
  if (startingAfter) params.set("starting_after", startingAfter);

  return stripeFetch<StripeListResponse<StripeBalanceTransaction>>(
    accessToken,
    `/balance_transactions?${params}`
  );
}

export async function getStripeTransactionDetail(
  accessToken: string,
  transactionId: string
): Promise<StripeBalanceTransaction> {
  const params = new URLSearchParams({
    "expand[]": "source",
  });
  return stripeFetch<StripeBalanceTransaction>(
    accessToken,
    `/balance_transactions/${transactionId}?${params}`
  );
}

export async function getStripePaymentIntents(
  accessToken: string,
  limit = 50
): Promise<StripeListResponse<Record<string, unknown>>> {
  const params = new URLSearchParams({
    limit: String(limit),
    "expand[]": "data.customer",
  });
  return stripeFetch<StripeListResponse<Record<string, unknown>>>(
    accessToken,
    `/payment_intents?${params}`
  );
}

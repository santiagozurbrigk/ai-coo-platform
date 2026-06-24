import { MP_API_BASE_URL } from "@/lib/mercadopago/config";

export type MPPayment = {
  id: number;
  date_created: string;
  date_approved: string | null;
  money_release_date: string | null;
  status: string;
  status_detail: string;
  currency_id: string;
  description: string | null;
  transaction_amount: number;
  transaction_amount_refunded: number;
  payment_method_id: string | null;
  payment_type_id: string | null;
  payer?: {
    email?: string | null;
  };
  transaction_details?: {
    net_received_amount?: number | null;
    total_paid_amount?: number | null;
    installment_amount?: number | null;
  };
};

export type MPPaymentsSearchResponse = {
  paging: { total: number; limit: number; offset: number };
  results: MPPayment[];
};

export type MPBalanceAmount = {
  amount: number;
  currency: string;
};

export type MPBalance = {
  available: MPBalanceAmount[];
  pending: MPBalanceAmount[];
};

async function mpFetch<T>(
  accessToken: string,
  path: string
): Promise<T> {
  const res = await fetch(`${MP_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  const json = (await res.json().catch(() => ({}))) as T & {
    message?: string;
    error?: string;
  };

  if (!res.ok) {
    throw new Error(
      json.message ?? json.error ?? `Mercado Pago API error (${res.status})`
    );
  }

  return json;
}

export async function searchMercadoPagoPayments(
  accessToken: string,
  options: {
    limit?: number;
    offset?: number;
    collectorId?: string;
  } = {}
): Promise<MPPaymentsSearchResponse> {
  const params = new URLSearchParams({
    sort: "date_created",
    criteria: "desc",
    range: "date_created",
    begin_date: "NOW-90DAYS",
    end_date: "NOW",
    limit: String(options.limit ?? 50),
    offset: String(options.offset ?? 0),
  });

  if (options.collectorId) {
    params.set("collector.id", options.collectorId);
  }

  return mpFetch<MPPaymentsSearchResponse>(
    accessToken,
    `/v1/payments/search?${params}`
  );
}

export async function getMercadoPagoPayment(
  accessToken: string,
  paymentId: string | number
): Promise<MPPayment> {
  return mpFetch<MPPayment>(accessToken, `/v1/payments/${paymentId}`);
}

export function deriveMercadoPagoBalance(payments: MPPayment[]): MPBalance {
  const now = Date.now();
  const available = new Map<string, number>();
  const pending = new Map<string, number>();

  for (const payment of payments) {
    if (payment.status !== "approved") continue;

    const currency = payment.currency_id ?? "ARS";
    const net =
      payment.transaction_details?.net_received_amount ??
      payment.transaction_amount;

    const releaseMs = payment.money_release_date
      ? new Date(payment.money_release_date).getTime()
      : now;

    const bucket = releaseMs <= now ? available : pending;
    bucket.set(currency, (bucket.get(currency) ?? 0) + net);
  }

  const toList = (map: Map<string, number>): MPBalanceAmount[] =>
    Array.from(map.entries()).map(([currency, amount]) => ({ currency, amount }));

  return {
    available: toList(available),
    pending: toList(pending),
  };
}

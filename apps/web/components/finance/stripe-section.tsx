"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  GlassPanel,
  cn,
} from "@ai-coo/ui";
import {
  getStripeBalanceAction,
  getStripeIntegrationStatusAction,
  getStripeTransactionDetailAction,
  getStripeTransactionsAction,
  type StripeIntegrationStatus,
} from "@/app/stripe/actions";
import type {
  StripeBalance,
  StripeBalanceTransaction,
} from "@/lib/stripe/api";
import {
  formatStripeDate,
  formatStripeMoney,
} from "@/lib/stripe/format";
import { paths } from "@/routes";

const TYPE_STYLES: Record<string, string> = {
  charge: "text-emerald-500",
  refund: "text-red-500",
  payout: "text-blue-500",
  adjustment: "text-muted-foreground",
};

const TYPE_LABELS: Record<string, string> = {
  charge: "Cargo",
  refund: "Reembolso",
  payout: "Retiro",
  adjustment: "Ajuste",
};

function typeLabel(type: string) {
  return TYPE_LABELS[type] ?? type;
}

function sumByCurrency(
  items: { amount: number; currency: string }[]
): { amount: number; currency: string }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = item.currency.toLowerCase();
    map.set(key, (map.get(key) ?? 0) + item.amount);
  }
  return Array.from(map.entries()).map(([currency, amount]) => ({
    currency,
    amount,
  }));
}

function BalanceCard({
  title,
  amounts,
}: {
  title: string;
  amounts: { amount: number; currency: string }[];
}) {
  return (
    <GlassPanel className="p-4 dark:border-glass dark:bg-glass dark:backdrop-blur-md">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-2 space-y-1">
        {amounts.length === 0 ? (
          <p className="text-lg font-semibold tabular-nums">—</p>
        ) : (
          amounts.map((a) => (
            <p key={a.currency} className="text-lg font-semibold tabular-nums">
              {formatStripeMoney(a.amount, a.currency)}
            </p>
          ))
        )}
      </div>
    </GlassPanel>
  );
}

export function StripeSection() {
  const [status, setStatus] = useState<StripeIntegrationStatus | null>(null);
  const [balance, setBalance] = useState<StripeBalance | null>(null);
  const [transactions, setTransactions] = useState<StripeBalanceTransaction[]>(
    []
  );
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<StripeBalanceTransaction | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const integration = await getStripeIntegrationStatusAction();
      setStatus(integration);
      if (!integration.connected) {
        setBalance(null);
        setTransactions([]);
        return;
      }

      const [balanceData, txData] = await Promise.all([
        getStripeBalanceAction(),
        getStripeTransactionsAction(50),
      ]);
      setBalance(balanceData);
      setTransactions(txData?.data ?? []);
      setHasMore(txData?.has_more ?? false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totalAmounts = useMemo(() => {
    if (!balance) return [];
    const available = sumByCurrency(balance.available ?? []);
    const pending = sumByCurrency(balance.pending ?? []);
    const map = new Map<string, number>();
    for (const item of [...available, ...pending]) {
      map.set(item.currency, (map.get(item.currency) ?? 0) + item.amount);
    }
    return Array.from(map.entries()).map(([currency, amount]) => ({
      currency,
      amount,
    }));
  }, [balance]);

  const openDetail = async (tx: StripeBalanceTransaction) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(tx);
    try {
      const full = await getStripeTransactionDetailAction(tx.id);
      if (full) setDetail(full);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadMore = async () => {
    const lastId = transactions.at(-1)?.id;
    if (!lastId) return;
    setLoadingMore(true);
    try {
      const txData = await getStripeTransactionsAction(50, lastId);
      if (txData) {
        setTransactions((prev) => [...prev, ...txData.data]);
        setHasMore(txData.has_more);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Stripe</h3>
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </section>
    );
  }

  if (!status?.connected) {
    return (
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Stripe</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Balance, transacciones e ingresos en tiempo real
          </p>
        </div>
        <GlassPanel className="flex flex-col items-center justify-center gap-4 px-8 py-12 text-center dark:border-glass dark:bg-glass dark:backdrop-blur-md">
          <p className="max-w-md text-sm text-muted-foreground">
            Conectá tu cuenta Stripe para ver balance disponible, movimientos
            pendientes e historial de transacciones.
          </p>
          <Button asChild>
            <a href="/api/integrations/stripe/connect">Conectar Stripe</a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={paths.platform.integrations}>Ir a Integraciones</Link>
          </Button>
        </GlassPanel>
      </section>
    );
  }

  const customerEmail =
    detail?.source?.billing_details?.email ??
    detail?.source?.receipt_email ??
    null;

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Stripe</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cuenta {status.stripeAccountId}
            {status.livemode === false ? " · modo prueba" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadData()}>
          Actualizar
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <BalanceCard title="Disponible" amounts={balance?.available ?? []} />
        <BalanceCard title="Pendiente" amounts={balance?.pending ?? []} />
        <BalanceCard title="Total" amounts={totalAmounts} />
      </div>

      <GlassPanel className="overflow-hidden p-0 dark:border-glass dark:bg-glass dark:backdrop-blur-md">
        <div className="border-b border-border/40 px-4 py-3">
          <h4 className="text-sm font-medium">Historial de transacciones</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-4 py-2 font-medium">Descripción</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium text-right">Monto</th>
                <th className="px-4 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="cursor-pointer border-b border-border/20 transition-colors hover:bg-muted/30"
                  onClick={() => void openDetail(tx)}
                >
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatStripeDate(tx.created)}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {tx.description ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "text-xs font-medium capitalize",
                        TYPE_STYLES[tx.type] ?? "text-muted-foreground"
                      )}
                    >
                      {typeLabel(tx.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatStripeMoney(tx.amount, tx.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[10px]">
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            Sin transacciones todavía.
          </p>
        )}
        {hasMore && (
          <div className="border-t border-border/40 px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={loadingMore}
              onClick={() => void loadMore()}
            >
              {loadingMore ? "Cargando…" : "Cargar más"}
            </Button>
          </div>
        )}
      </GlassPanel>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalle de transacción</DialogTitle>
          </DialogHeader>
          {detailLoading || !detail ? (
            <p className="text-sm text-muted-foreground">Cargando…</p>
          ) : (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">ID</dt>
                <dd className="font-mono text-xs break-all">{detail.id}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Fecha</dt>
                <dd>{formatStripeDate(detail.created)}</dd>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Monto</dt>
                  <dd className="font-medium tabular-nums">
                    {formatStripeMoney(detail.amount, detail.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Fee</dt>
                  <dd className="tabular-nums">
                    {formatStripeMoney(detail.fee, detail.currency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Neto</dt>
                  <dd className="font-medium tabular-nums">
                    {formatStripeMoney(detail.net, detail.currency)}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Descripción</dt>
                <dd>{detail.description ?? "—"}</dd>
              </div>
              {customerEmail && (
                <div>
                  <dt className="text-xs text-muted-foreground">Email cliente</dt>
                  <dd>{customerEmail}</dd>
                </div>
              )}
              {detail.source?.description && (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Descripción del pago
                  </dt>
                  <dd>{detail.source.description}</dd>
                </div>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

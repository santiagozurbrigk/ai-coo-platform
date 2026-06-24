"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  GlassPanel,
  MetricBand,
  MetricStat,
  cn,
} from "@ai-coo/ui";
import {
  getMercadoPagoBalanceAction,
  getMercadoPagoIntegrationStatusAction,
  getMercadoPagoPaymentDetailAction,
  getMercadoPagoTransactionsAction,
  type MercadoPagoIntegrationStatus,
} from "@/app/mercadopago/actions";
import type { MPBalance, MPPayment } from "@/lib/mercadopago/api";
import {
  formatMercadoPagoDate,
  formatMercadoPagoMoney,
} from "@/lib/mercadopago/format";
import { paths } from "@/routes";

const STATUS_STYLES: Record<string, string> = {
  approved: "text-emerald-500",
  refunded: "text-red-500",
  rejected: "text-red-500",
  pending: "text-amber-500",
};

function formatBalanceAmounts(amounts: { amount: number; currency: string }[]): {
  value: string;
  subtitle?: string;
} {
  if (amounts.length === 0) return { value: "—" };
  const [first, ...rest] = amounts;
  return {
    value: formatMercadoPagoMoney(first.amount, first.currency),
    subtitle:
      rest.length > 0
        ? rest.map((a) => formatMercadoPagoMoney(a.amount, a.currency)).join(" · ")
        : undefined,
  };
}

function BalanceStat({
  title,
  amounts,
}: {
  title: string;
  amounts: { amount: number; currency: string }[];
}) {
  const { value, subtitle } = formatBalanceAmounts(amounts);
  return <MetricStat title={title} value={value} subtitle={subtitle} />;
}

export function MercadoPagoSection() {
  const [status, setStatus] = useState<MercadoPagoIntegrationStatus | null>(
    null
  );
  const [balance, setBalance] = useState<MPBalance | null>(null);
  const [transactions, setTransactions] = useState<MPPayment[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<MPPayment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const integration = await getMercadoPagoIntegrationStatusAction();
      setStatus(integration);
      if (!integration.connected) {
        setBalance(null);
        setTransactions([]);
        return;
      }

      const [balanceData, txData] = await Promise.all([
        getMercadoPagoBalanceAction(),
        getMercadoPagoTransactionsAction({ limit: 50, offset: 0 }),
      ]);
      setBalance(balanceData);
      setTransactions(txData?.results ?? []);
      const paging = txData?.paging;
      setHasMore(
        paging ? paging.offset + paging.limit < paging.total : false
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openDetail = async (payment: MPPayment) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(payment);
    try {
      const full = await getMercadoPagoPaymentDetailAction(payment.id);
      if (full) setDetail(full);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const txData = await getMercadoPagoTransactionsAction({
        limit: 50,
        offset: transactions.length,
      });
      if (txData) {
        setTransactions((prev) => [...prev, ...txData.results]);
        const paging = txData.paging;
        setHasMore(paging.offset + paging.limit < paging.total);
      }
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <h3 className="text-sm font-medium">Mercado Pago</h3>
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </section>
    );
  }

  if (!status?.connected) {
    return (
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-medium">Mercado Pago</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Balance estimado y pagos recientes de tu cuenta
          </p>
        </div>
        <GlassPanel className="flex flex-col items-center justify-center gap-4 px-8 py-12 text-center dark:border-glass dark:bg-glass dark:backdrop-blur-md">
          <p className="max-w-md text-sm text-muted-foreground">
            Conectá tu cuenta de Mercado Pago para ver pagos aprobados y el
            saldo estimado según liberaciones de fondos.
          </p>
          <Button asChild>
            <a href="/api/integrations/mercadopago/connect">
              Conectar Mercado Pago
            </a>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={paths.platform.integrations}>Ir a Integraciones</Link>
          </Button>
        </GlassPanel>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">Mercado Pago</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cuenta {status.mpUserId}
            {status.livemode === false ? " · modo prueba" : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void loadData()}>
          Actualizar
        </Button>
      </div>

      <MetricBand glass>
        <BalanceStat title="Liberado" amounts={balance?.available ?? []} />
        <BalanceStat title="Pendiente" amounts={balance?.pending ?? []} />
      </MetricBand>

      <GlassPanel className="overflow-hidden p-0 dark:border-glass dark:bg-glass dark:backdrop-blur-md">
        <div className="border-b border-border/40 px-4 py-3">
          <h4 className="text-sm font-medium">Pagos recientes</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border/40 text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-4 py-2 font-medium">Descripción</th>
                <th className="px-4 py-2 font-medium">Método</th>
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
                    {formatMercadoPagoDate(tx.date_created)}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {tx.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs capitalize">
                    {tx.payment_method_id ?? tx.payment_type_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatMercadoPagoMoney(
                      tx.transaction_amount,
                      tx.currency_id
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] capitalize",
                        STATUS_STYLES[tx.status]
                      )}
                    >
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
            Sin pagos en los últimos 90 días.
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
            <DialogTitle>Detalle del pago</DialogTitle>
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
                <dd>{formatMercadoPagoDate(detail.date_created)}</dd>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="text-xs text-muted-foreground">Monto</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMercadoPagoMoney(
                      detail.transaction_amount,
                      detail.currency_id
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Neto</dt>
                  <dd className="tabular-nums">
                    {formatMercadoPagoMoney(
                      detail.transaction_details?.net_received_amount ??
                        detail.transaction_amount,
                      detail.currency_id
                    )}
                  </dd>
                </div>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Descripción</dt>
                <dd>{detail.description ?? "—"}</dd>
              </div>
              {detail.payer?.email && (
                <div>
                  <dt className="text-xs text-muted-foreground">Email pagador</dt>
                  <dd>{detail.payer.email}</dd>
                </div>
              )}
              {detail.money_release_date && (
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Liberación de fondos
                  </dt>
                  <dd>{formatMercadoPagoDate(detail.money_release_date)}</dd>
                </div>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

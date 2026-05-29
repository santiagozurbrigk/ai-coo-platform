export type PaymentPlatformConfig = {
  id: string;
  name: string;
  /** Clave para mapear pagos de clientes (stripe, wise, mercadopago). */
  slug?: string;
  currency: string;
  accountLabel?: string;
  totalReceived: number;
  lastTransactionAt: string;
};

export type CloserPerformance = {
  id: string;
  name: string;
  dealsClosed: number;
  revenue: number;
  commission: number;
};

export type PendingByMonth = {
  month: string;
  amount: number;
};

export type FinanceSummary = {
  facturacion: number;
  cashCollected: number;
  porCobrar: number;
  porCobrarByMonth: PendingByMonth[];
  gastosTotales: number;
  margenPercent: number;
  closerBreakdown: CloserPerformance[];
  platformBalances: { platformId: string; amount: number }[];
};

export type MonthlySeriesPoint = {
  month: string;
  facturacion: number;
  cashCollected: number;
  upfront: number;
  installments: number;
  fees: number;
  marginPercent: number;
};

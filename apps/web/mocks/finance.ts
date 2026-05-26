import type {
  FinanceSummary,
  MonthlySeriesPoint,
  PaymentPlatformConfig,
} from "@/types/finance";

export const mockPaymentPlatforms: PaymentPlatformConfig[] = [
  {
    id: "pp-stripe",
    name: "Stripe",
    currency: "USD",
    accountLabel: "Stripe USD",
    totalReceived: 18400,
    lastTransactionAt: "2026-05-24",
  },
  {
    id: "pp-wise",
    name: "Wise",
    currency: "USD",
    accountLabel: "Wise USD Main Account",
    totalReceived: 9200,
    lastTransactionAt: "2026-05-22",
  },
  {
    id: "pp-mp",
    name: "MercadoPago",
    currency: "ARS",
    accountLabel: "Cuenta ARS",
    totalReceived: 450000,
    lastTransactionAt: "2026-05-20",
  },
];

export const mockFinanceSummary: FinanceSummary = {
  facturacion: 27600,
  cashCollected: 16240,
  porCobrar: 14500,
  porCobrarByMonth: [
    { month: "Junio", amount: 6000 },
    { month: "Julio", amount: 5500 },
    { month: "Agosto", amount: 3000 },
  ],
  gastosTotales: 11360,
  margenPercent: 58.8,
  closerBreakdown: [
    {
      id: "cp1",
      name: "Martín López",
      dealsClosed: 8,
      revenue: 24000,
      commission: 2400,
    },
    {
      id: "cp2",
      name: "Diego Fernández",
      dealsClosed: 5,
      revenue: 15000,
      commission: 1500,
    },
  ],
  platformBalances: [
    { platformId: "pp-stripe", amount: 18400 },
    { platformId: "pp-wise", amount: 9200 },
    { platformId: "pp-mp", amount: 450000 },
  ],
};

export const mockMonthlySeries: MonthlySeriesPoint[] = [
  {
    month: "Dic",
    facturacion: 18200,
    cashCollected: 11200,
    upfront: 12000,
    installments: 4800,
    fees: 1400,
    marginPercent: 61,
  },
  {
    month: "Ene",
    facturacion: 21400,
    cashCollected: 12800,
    upfront: 14000,
    installments: 5200,
    fees: 2200,
    marginPercent: 59,
  },
  {
    month: "Feb",
    facturacion: 19800,
    cashCollected: 11900,
    upfront: 11000,
    installments: 6100,
    fees: 2700,
    marginPercent: 60,
  },
  {
    month: "Mar",
    facturacion: 24100,
    cashCollected: 14100,
    upfront: 15000,
    installments: 7200,
    fees: 1900,
    marginPercent: 58,
  },
  {
    month: "Abr",
    facturacion: 25900,
    cashCollected: 15200,
    upfront: 16500,
    installments: 7400,
    fees: 2000,
    marginPercent: 57,
  },
  {
    month: "May",
    facturacion: 27600,
    cashCollected: 16240,
    upfront: 17200,
    installments: 8400,
    fees: 2000,
    marginPercent: 58.8,
  },
];

export const PLATFORM_SUGGESTIONS = [
  "Stripe",
  "MercadoPago",
  "PayPal",
  "Wise",
  "Bank Transfer",
  "Other",
] as const;

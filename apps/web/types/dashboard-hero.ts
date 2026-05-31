export type DashboardHeroMetrics = {
  facturacion: number;
  facturacionTrend: { label: string; value: number }[];
  cashCollected: number;
  cashTrend: { label: string; value: number }[];
  bookingRate: number;
  ghostingRate: number;
  avgResponseMin: number;
  activeConversations: number;
  activeClients: number;
};

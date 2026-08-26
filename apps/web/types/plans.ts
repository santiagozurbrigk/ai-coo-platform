/**
 * Sistema de cuotas de un plan.
 * Un plan puede tener múltiples sistemas (ej: "2 cuotas", "3 cuotas VIP")
 * cada uno con distinto número de cuotas y monto sugerido por cuota.
 */
export type InstallmentSystem = {
  id: string;
  /** Nombre descriptivo del sistema, ej: "2 cuotas de $1000" */
  name: string;
  /** Número de cuotas */
  count: number;
  /** Monto sugerido por cuota (el closer puede overridearlo al registrar el cierre) */
  amountPerInstallment: number;
};

export type Plan = {
  id: string;
  name: string;
  durationDays?: number;
  installmentSystems: InstallmentSystem[];
  createdAt: string;
};

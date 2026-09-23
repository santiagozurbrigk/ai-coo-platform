/** Módulos add-on disponibles por org — archivo de sola constante, sin imports de servidor */
export const ADD_ON_IDS = [
  "operaciones",
  "producto",
  "ejecutivo",
  "inteligencia",
  "embudos",
  /**
   * Clientes de clientes: cada cliente (un growth partner) tiene sus propios
   * clientes, con Marketing, Ventas y Sistemas por cada uno, más la facturación
   * del negocio. Hecho para Limitless.
   */
  "growth_partners",
] as const;

export type AddOnId = (typeof ADD_ON_IDS)[number];

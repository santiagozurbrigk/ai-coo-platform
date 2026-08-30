/** Módulos add-on disponibles por org — archivo de sola constante, sin imports de servidor */
export const ADD_ON_IDS = [
  "operaciones",
  "producto",
  "ejecutivo",
  "inteligencia",
  "embudos",
] as const;

export type AddOnId = (typeof ADD_ON_IDS)[number];

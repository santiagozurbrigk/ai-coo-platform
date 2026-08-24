// Constante compartilhada de localizações de snapshots de métricas.
// Separada do arquivo "use server" porque arquivos de servidor só podem exportar funções assíncronas.

export const SNAPSHOT_LOCATIONS = [
  { value: "dashboard",  label: "Panel General"  },
  { value: "sales",      label: "Ventas"          },
  { value: "closing",    label: "Closing"         },
  { value: "clients",    label: "Clientes"        },
  { value: "marketing",  label: "Marketing"       },
  { value: "finance",    label: "Finanzas"        },
] as const;

export type SnapshotLocation = (typeof SNAPSHOT_LOCATIONS)[number]["value"];

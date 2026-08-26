import type { IntegrationProvider } from "@/constants/integrations";

export type IntegrationGroup = {
  label: string;
  integrations: IntegrationProvider[];
};

export const INTEGRATION_GROUPS: IntegrationGroup[] = [
  {
    label: "Ventas y conversaciones",
    integrations: [
      "manychat",
      "zernio",
      "calendly",
      "ghl",
    ],
  },
  {
    label: "Contenido y marketing",
    integrations: ["google_ecosystem", "youtube", "fathom"],
  },
  {
    label: "Formularios y datos",
    integrations: ["typeform", "airtable"],
  },
  {
    label: "Documentación y conocimiento",
    integrations: ["notion"],
  },
];

export const INTEGRATION_DESCRIPTIONS: Partial<
  Record<IntegrationProvider, string>
> = {
  unipile_instagram:
    "DMs de Instagram personal en el inbox de ventas. Distinto de la integración de métricas de contenido.",
  unipile_whatsapp:
    "WhatsApp personal en el inbox de ventas, con scoring de IA igual que ManyChat.",
  zernio:
    "Conecta tu cuenta de Zernio para sincronizar mensajes de Instagram Direct y WhatsApp en un solo inbox.",
  google_ecosystem:
    "Google Drive y Google Forms (+ YouTube si usás la misma cuenta Google) conectados con OAuth.",
  manychat:
    "Conecta con tu API key. Los mensajes nuevos llegan vía External Request.",
  calendly:
    "Importa llamadas de cierre. Sin plan Standard, sincronizá manualmente.",
  ghl:
    "GoHighLevel — importa citas del calendario. Alternativa a Calendly.",
  instagram:
    "Visualizá el rendimiento de tu contenido y su impacto en ventas.",
  youtube: "Canal de YouTube en otra cuenta de Google. Conectá con tu API key de YouTube Data.",
  fathom: "Reuniones y transcripciones con tu API key de Fathom.",
  typeform: "Formularios, respuestas y lead scoring.",
  google_forms:
    "Google Forms, Drive y respuestas en un solo flujo OAuth.",
  airtable: "Sincroniza bases y registros operativos.",
  notion: "Documentación y bases de conocimiento para la IA.",
  discord:
    "Captura conversaciones con clientes y detecta testimonios automáticamente.",
  google_sheets: "Hojas de cálculo vinculadas a operaciones.",
  google_docs: "Documentos colaborativos en tu base de conocimiento.",
  loom: "Videos y grabaciones para contexto de negocio.",
  miro: "Tableros visuales para la base de conocimiento.",
};

export function groupIntegrationsByCategory<
  T extends { provider: IntegrationProvider },
>(integrations: T[]): { label: string; items: T[] }[] {
  const byProvider = new Map(integrations.map((i) => [i.provider, i]));
  const grouped = new Set<IntegrationProvider>();

  const sections = INTEGRATION_GROUPS.map((group) => {
    const items = group.integrations
      .map((provider) => byProvider.get(provider))
      .filter((item): item is T => item != null);
    items.forEach((item) => grouped.add(item.provider));
    return { label: group.label, items };
  }).filter((section) => section.items.length > 0);

  const remaining = integrations.filter((i) => !grouped.has(i.provider));
  if (remaining.length > 0) {
    sections.push({ label: "Más integraciones", items: remaining });
  }

  return sections;
}

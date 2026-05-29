import type {
  BrainCategory,
  BrainContentBreakdown,
  BrainContentStatus,
  BrainContentType,
  BrainCoverageArea,
  BrainDocument,
  BrainHealth,
  BrainRecentItem,
  CoverageLevel,
} from "@/types/ai-brain";

export type AiBrainDocumentRow = {
  id: string;
  title: string;
  category: string;
  content_type: string;
  file_url: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  source_url: string | null;
  description: string | null;
  tags: string[] | null;
  status: string;
  uploaded_by: string | null;
  coverage_areas: string[] | null;
  created_at: string;
  updated_at: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  sales_methodology: "Metodología de ventas",
  operational_systems: "Sistemas operativos",
  sop_frameworks: "Frameworks de SOP",
  team_management: "Gestión de equipo",
  onboarding: "Onboarding",
  content_strategy: "Estrategia de contenido",
  financial_planning: "Planificación financiera",
  financial: "Planificación financiera",
  general: "General",
};

const TYPE_LABELS: Record<BrainContentType, string> = {
  document: "Documento",
  image: "Imagen",
  transcript: "Transcripción",
  miro: "Miro Board",
  framework: "Framework",
  playbook: "Playbook",
};

const COVERAGE_AREA_DEFS: { id: string; label: string }[] = [
  { id: "sales_methodology", label: "Sales Methodology" },
  { id: "operational_systems", label: "Operational Systems" },
  { id: "sop_frameworks", label: "SOP Frameworks" },
  { id: "team_management", label: "Team Management" },
  { id: "onboarding", label: "Onboarding" },
  { id: "content_strategy", label: "Content Strategy" },
  { id: "financial_planning", label: "Financial Planning" },
];

export function dbContentTypeToUi(type: string): BrainContentType {
  if (type === "miro_board") return "miro";
  if (type === "image" || type === "png" || type === "jpeg") return "image";
  if (
    type === "document" ||
    type === "transcript" ||
    type === "framework" ||
    type === "playbook"
  ) {
    return type;
  }
  return "document";
}

export function uiContentTypeToDb(type: BrainContentType): string {
  if (type === "miro") return "miro_board";
  return type;
}

export function dbStatusToUi(status: string): BrainContentStatus {
  if (status === "pending_indexing") return "indexing";
  if (status === "active") return "active";
  if (status === "archived") return "archived";
  return "error";
}

export function uiStatusToDb(status: BrainContentStatus): string {
  if (status === "indexing") return "pending_indexing";
  return status;
}

function formatBytes(bytes: number | null): string {
  if (bytes == null || bytes <= 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function rowToBrainDocument(row: AiBrainDocumentRow): BrainDocument {
  const type = dbContentTypeToUi(row.content_type);
  const category = row.category as BrainCategory;
  return {
    id: row.id,
    title: row.title,
    type,
    category,
    categoryLabel: CATEGORY_LABELS[row.category] ?? row.category,
    size: formatBytes(row.file_size_bytes),
    status: dbStatusToUi(row.status),
    uploadedBy: row.uploaded_by ?? "Super Admin",
    uploadDate: row.created_at.slice(0, 10),
    description: row.description ?? undefined,
    tags: row.tags ?? [],
    coverageAreas: row.coverage_areas ?? [],
    usageStats: {
      sops: 0,
      sales: 0,
      reports: 0,
      lastReferenced: "—",
    },
    previewText: row.source_url ?? row.file_name ?? undefined,
  };
}

export function buildBrainHealth(rows: AiBrainDocumentRow[]): BrainHealth {
  const active = rows.filter((r) => r.status === "active").length;
  return {
    status: "active",
    documentsLoaded: rows.filter((r) => r.status !== "archived").length,
    frameworks: rows.filter((r) => r.content_type === "framework").length,
    transcripts: rows.filter((r) => r.content_type === "transcript").length,
    images: rows.filter((r) =>
      ["image", "png", "jpeg", "webp"].includes(r.content_type)
    ).length,
    miroBoards: rows.filter((r) => r.content_type === "miro_board").length,
    lastUpdated:
      rows.length > 0
        ? rows
            .map((r) => r.updated_at)
            .sort()
            .reverse()[0]
            ?.slice(0, 10) ?? "—"
        : "—",
  };
}

export function buildContentBreakdown(
  rows: AiBrainDocumentRow[]
): BrainContentBreakdown[] {
  const counts = new Map<BrainContentType, number>();
  for (const row of rows) {
    const t = dbContentTypeToUi(row.content_type);
    counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const total = rows.length || 1;
  return (Object.keys(TYPE_LABELS) as BrainContentType[])
    .map((type) => ({
      type,
      label: TYPE_LABELS[type],
      count: counts.get(type) ?? 0,
      pct: Math.round(((counts.get(type) ?? 0) / total) * 100),
    }))
    .filter((x) => x.count > 0);
}

export function buildCoverageAreas(
  rows: AiBrainDocumentRow[]
): BrainCoverageArea[] {
  return COVERAGE_AREA_DEFS.map(({ id, label }) => {
    const docs = rows.filter(
      (r) =>
        r.status !== "archived" &&
        (r.coverage_areas?.includes(id) || r.category === id)
    );
    const count = docs.length;
    let level: CoverageLevel = "not_covered";
    if (count >= 3) level = "covered";
    else if (count >= 1) level = "partial";
    return { id, label, level, docCount: count };
  });
}

export function buildRecentItems(
  rows: AiBrainDocumentRow[]
): BrainRecentItem[] {
  return [...rows]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 8)
    .map((row) => ({
      id: row.id,
      title: row.title,
      type: dbContentTypeToUi(row.content_type),
      uploadedBy: row.uploaded_by ?? "Super Admin",
      uploadDate: row.created_at.slice(0, 10),
      status: dbStatusToUi(row.status),
    }));
}

export function countByStatus(rows: AiBrainDocumentRow[]) {
  return {
    active: rows.filter((r) => r.status === "active").length,
    pending: rows.filter((r) => r.status === "pending_indexing").length,
    archived: rows.filter((r) => r.status === "archived").length,
    error: rows.filter((r) => r.status === "error").length,
  };
}

export const AI_BRAIN_BUCKET = "ai-brain-documents";

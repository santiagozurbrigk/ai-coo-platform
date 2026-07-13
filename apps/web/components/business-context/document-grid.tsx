"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, List, Search } from "lucide-react";
import { Input, StaggerFade, StaggerFadeItem, cn } from "@ai-coo/ui";
import type {
  ContextDocument,
  DocumentCategory,
  FathomKnowledgeCall,
} from "@/types/business-context";
import { DocumentCard } from "./document-card";
import { FathomClientCallCard } from "./fathom-client-call-card";
import { FathomContextCallCard } from "./fathom-context-call-card";
import { KnowledgeBaseEmptyState } from "./knowledge-base-empty-state";

type CategoryFilter = DocumentCategory | "all";
type SortOption = "newest" | "oldest" | "category";
type ViewMode = "grid" | "list";

const CATEGORY_KEYS: CategoryFilter[] = [
  "all",
  "meetings",
  "frameworks",
  "training",
  "sales",
  "operations",
];

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "Todas",
  meetings: "Reuniones",
  frameworks: "Frameworks",
  training: "Training",
  sales: "Ventas",
  operations: "Operaciones",
};

const tabClass =
  "rounded-full border px-3 py-1 text-xs font-medium transition-colors";

export function DocumentGrid({
  documents,
  contextCalls = [],
  clientMeetingCalls = [],
}: {
  documents: ContextDocument[];
  contextCalls?: FathomKnowledgeCall[];
  clientMeetingCalls?: FathomKnowledgeCall[];
}) {
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryFilter, number> = {
      all: documents.length,
      meetings: 0,
      frameworks: 0,
      training: 0,
      sales: 0,
      operations: 0,
    };
    for (const doc of documents) {
      if (doc.category in counts) counts[doc.category]++;
    }
    return counts;
  }, [documents]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const base = documents.filter((doc) => {
      if (filter !== "all" && doc.category !== filter) return false;
      if (!query) return true;
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query) ||
        doc.preview.toLowerCase().includes(query) ||
        doc.source.toLowerCase().includes(query)
      );
    });

    return [...base].sort((a, b) => {
      if (sort === "newest") return b.updatedAt.localeCompare(a.updatedAt);
      if (sort === "oldest") return a.updatedAt.localeCompare(b.updatedAt);
      return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
    });
  }, [documents, filter, search, sort]);

  const showFathomCalls = filter === "all" || filter === "meetings";
  const visibleClientCalls = showFathomCalls ? clientMeetingCalls : [];
  const visibleContextCalls = showFathomCalls ? contextCalls : [];
  const totalItems =
    filtered.length + visibleClientCalls.length + visibleContextCalls.length;

  const hasNoContent =
    documents.length === 0 &&
    contextCalls.length === 0 &&
    clientMeetingCalls.length === 0;

  if (hasNoContent) {
    return <KnowledgeBaseEmptyState />;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o contenido…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="h-9 rounded-lg border border-border/60 bg-background px-3 text-xs text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="newest">Más reciente</option>
          <option value="oldest">Más antiguo</option>
          <option value="category">Por categoría</option>
        </select>

        <div className="flex items-center rounded-lg border border-border/60 bg-background p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Vista grilla"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              viewMode === "list"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Vista lista"
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_KEYS.map((key) => {
          const count = categoryCounts[key];
          const label =
            key === "all"
              ? `Todas (${count})`
              : count > 0
                ? `${CATEGORY_LABELS[key]} (${count})`
                : CATEGORY_LABELS[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? `${tabClass} border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300`
                  : `${tabClass} border-border/40 bg-muted/20 text-muted-foreground hover:border-border/70`
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {totalItems === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground dark:border-white/[0.08]">
          No hay documentos que coincidan con la búsqueda o categoría seleccionada.
        </p>
      ) : viewMode === "list" ? (
        <div className="space-y-2">
          {visibleClientCalls.map((call) => (
            <FathomClientCallCard key={call.id} call={call} />
          ))}
          {visibleContextCalls.map((call) => (
            <FathomContextCallCard key={call.id} call={call} />
          ))}
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} listView />
          ))}
        </div>
      ) : (
        <StaggerFade className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleClientCalls.map((call) => (
            <StaggerFadeItem key={call.id}>
              <FathomClientCallCard call={call} />
            </StaggerFadeItem>
          ))}
          {visibleContextCalls.map((call) => (
            <StaggerFadeItem key={call.id}>
              <FathomContextCallCard call={call} />
            </StaggerFadeItem>
          ))}
          {filtered.map((doc) => (
            <StaggerFadeItem key={doc.id}>
              <DocumentCard document={doc} />
            </StaggerFadeItem>
          ))}
        </StaggerFade>
      )}
    </div>
  );
}

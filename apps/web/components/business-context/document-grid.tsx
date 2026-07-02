"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input, StaggerFade, StaggerFadeItem } from "@ai-coo/ui";
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

const FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "meetings", label: "Reuniones" },
  { key: "frameworks", label: "Frameworks" },
  { key: "training", label: "Training" },
  { key: "sales", label: "Ventas" },
  { key: "operations", label: "Operaciones" },
];

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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents.filter((doc) => {
      if (filter !== "all" && doc.category !== filter) return false;
      if (!query) return true;
      return (
        doc.title.toLowerCase().includes(query) ||
        doc.summary.toLowerCase().includes(query) ||
        doc.preview.toLowerCase().includes(query) ||
        doc.source.toLowerCase().includes(query)
      );
    });
  }, [documents, filter, search]);

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
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por título o contenido…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
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
        ))}
      </div>

      {totalItems === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 py-12 text-center text-sm text-muted-foreground dark:border-white/[0.08]">
          No hay documentos que coincidan con la búsqueda o categoría seleccionada.
        </p>
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

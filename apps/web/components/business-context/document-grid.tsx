"use client";

import { useState } from "react";
import { FilterPills } from "@/components/marketing/filter-pills";
import type {
  ContextDocument,
  FathomKnowledgeCall,
  KnowledgeBaseFilter,
} from "@/types/business-context";
import { EmptyState } from "@/components/shared/empty-state";
import { es } from "@/lib/locale/es";
import { DocumentCard } from "./document-card";
import { FathomClientCallCard } from "./fathom-client-call-card";
import { FathomContextCallCard } from "./fathom-context-call-card";

const FILTERS: { key: KnowledgeBaseFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "client_meetings", label: "Reuniones con clientes" },
  { key: "business_context", label: "Contexto de negocio" },
  { key: "meetings", label: "Reuniones" },
  { key: "frameworks", label: "Frameworks" },
  { key: "training", label: "Capacitación" },
  { key: "sales", label: "Ventas" },
  { key: "operations", label: "Operaciones" },
];

export function DocumentGrid({
  documents,
  contextCalls = [],
  clientMeetingCalls = [],
}: {
  documents: ContextDocument[];
  contextCalls?: FathomKnowledgeCall[];
  clientMeetingCalls?: FathomKnowledgeCall[];
}) {
  const [filter, setFilter] = useState<KnowledgeBaseFilter>("all");

  const filteredDocs =
    filter === "all" ||
    filter === "client_meetings" ||
    filter === "business_context"
      ? filter === "all"
        ? documents
        : []
      : documents.filter((d) => d.category === filter);

  const showClientMeetings =
    filter === "all" || filter === "client_meetings";
  const showContextCalls =
    filter === "all" || filter === "business_context";

  const visibleClientCalls = showClientMeetings ? clientMeetingCalls : [];
  const visibleContextCalls = showContextCalls ? contextCalls : [];
  const totalItems =
    filteredDocs.length +
    visibleClientCalls.length +
    visibleContextCalls.length;

  return (
    <div className="space-y-4">
      <FilterPills
        options={FILTERS.map(({ key, label }) => ({ value: key, label }))}
        value={filter}
        onChange={(value) => setFilter(value as KnowledgeBaseFilter)}
      />

      {totalItems === 0 ? (
        <EmptyState
          title={es.demo.noDocuments}
          description={es.demo.noDocumentsDesc}
          action={
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-sm text-primary hover:underline"
            >
              Ver todo el contenido
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibleClientCalls.map((call) => (
            <FathomClientCallCard key={call.id} call={call} />
          ))}
          {visibleContextCalls.map((call) => (
            <FathomContextCallCard key={call.id} call={call} />
          ))}
          {filteredDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

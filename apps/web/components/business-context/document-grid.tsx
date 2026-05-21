"use client";

import { useState } from "react";
import { cn } from "@ai-coo/ui";
import type { ContextDocument, DocumentCategory } from "@/types/business-context";
import { EmptyState } from "@/components/shared";
import { es } from "@/lib/locale/es";
import { DocumentCard } from "./document-card";

const FILTERS: { key: DocumentCategory | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "meetings", label: "Reuniones" },
  { key: "frameworks", label: "Frameworks" },
  { key: "training", label: "Capacitación" },
  { key: "sales", label: "Ventas" },
  { key: "operations", label: "Operaciones" },
];

export function DocumentGrid({ documents }: { documents: ContextDocument[] }) {
  const [filter, setFilter] = useState<DocumentCategory | "all">("all");
  const filtered =
    filter === "all"
      ? documents
      : documents.filter((d) => d.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title={es.demo.noDocuments}
          description={es.demo.noDocumentsDesc}
          action={
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-sm text-primary hover:underline"
            >
              Ver todos los documentos
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
}

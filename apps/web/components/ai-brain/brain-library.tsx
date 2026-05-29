"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Eye, Search, Trash2 } from "lucide-react";
import { Badge, Button, DataTable, cn } from "@ai-coo/ui";
import { paths } from "@/routes";
import {
  archiveAiBrainDocumentAction,
  deleteAiBrainDocumentAction,
} from "@/app/super-admin/actions";
import type { BrainContentStatus, BrainContentType, BrainDocument } from "@/types/ai-brain";
import { BrainStatusBadge } from "./brain-status-badge";
import { BrainTypeIcon, brainTypeLabel } from "./brain-type-icon";

const TYPE_FILTERS: { key: BrainContentType | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "document", label: "Documentos" },
  { key: "image", label: "Imágenes" },
  { key: "transcript", label: "Transcripciones" },
  { key: "miro", label: "Miro Boards" },
  { key: "framework", label: "Frameworks" },
  { key: "playbook", label: "Playbooks" },
];

const STATUS_FILTERS: { key: BrainContentStatus | "all"; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Activos" },
  { key: "indexing", label: "Pendientes" },
  { key: "archived", label: "Archivados" },
];

export function BrainLibrary({ documents }: { documents: BrainDocument[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<BrainContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BrainContentStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    let list = documents;
    if (filter !== "all") list = list.filter((d) => d.type === filter);
    if (statusFilter !== "all") list = list.filter((d) => d.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.categoryLabel.toLowerCase().includes(q) ||
          d.uploadedBy.toLowerCase().includes(q) ||
          (d.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [documents, filter, statusFilter, query]);

  function archive(id: string) {
    startTransition(async () => {
      await archiveAiBrainDocumentAction(id);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("¿Eliminar permanentemente?")) return;
    startTransition(async () => {
      await deleteAiBrainDocumentAction(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar por título, categoría o autor…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-border/60 bg-muted/20 pl-9 pr-3 text-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
          />
        </div>
        <Button asChild size="sm">
          <Link href={paths.superAdmin.aiBrain.add}>Añadir contenido</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map(({ key, label }) => (
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
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setStatusFilter(key)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === key
                ? "bg-secondary text-secondary-foreground"
                : "bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <DataTable
        title="Biblioteca del cerebro"
        columns={[
          {
            key: "title",
            header: "Título",
            cell: (r) => (
              <Link
                href={paths.superAdmin.aiBrain.document(r.id)}
                className="font-medium hover:text-primary"
              >
                {r.title}
              </Link>
            ),
          },
          {
            key: "type",
            header: "Tipo",
            cell: (r) => (
              <span className="flex items-center gap-1.5">
                <BrainTypeIcon type={r.type} showLabel />
              </span>
            ),
          },
          {
            key: "category",
            header: "Categoría",
            cell: (r) => (
              <Badge variant="secondary" className="font-normal">
                {r.categoryLabel}
              </Badge>
            ),
          },
          { key: "size", header: "Tamaño", cell: (r) => r.size },
          {
            key: "status",
            header: "Estado",
            cell: (r) => <BrainStatusBadge status={r.status} />,
          },
          { key: "by", header: "Subido por", cell: (r) => r.uploadedBy },
          { key: "date", header: "Fecha", cell: (r) => r.uploadDate },
          {
            key: "actions",
            header: "Acciones",
            cell: (r) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Ver">
                  <Link href={paths.superAdmin.aiBrain.document(r.id)}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="Archivar"
                  disabled={pending}
                  onClick={() => archive(r.id)}
                >
                  <Archive className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  title="Eliminar"
                  disabled={pending}
                  onClick={() => remove(r.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        keyExtractor={(r) => r.id}
        emptyMessage={`Sin resultados${filter !== "all" ? ` para ${brainTypeLabel(filter as BrainContentType)}` : ""}.`}
      />
    </div>
  );
}

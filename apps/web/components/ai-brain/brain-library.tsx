"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, BrainCircuit, Eye, Loader2, Search, Sparkles, Trash2 } from "lucide-react";
import { Badge, Button, DataTable } from "@ai-coo/ui";
import { FilterPills } from "@/components/marketing/filter-pills";
import { paths } from "@/routes";
import {
  archiveAiBrainDocumentAction,
  deleteAiBrainDocumentAction,
  processAiBrainDocumentAction,
  submitBrainSummaryBatchAction,
  syncBrainBatchResultsAction,
} from "@/app/super-admin/actions";
import { useToast } from "@/providers/toast-provider";
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
  const { push: pushToast } = useToast();
  const [filter, setFilter] = useState<BrainContentType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BrainContentStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [pending, startTransition] = useTransition();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchPending, setBatchPending] = useState(false);

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

  function submitBatch() {
    setBatchPending(true);
    void submitBrainSummaryBatchAction().then((res) => {
      setBatchPending(false);
      if (res.success) {
        setBatchId(res.data.batchId);
        pushToast({
          title: "Batch enviado",
          description: `${res.data.docCount} documentos en proceso. Hacé clic en "Sincronizar" en unos minutos.`,
          variant: "success",
        });
      } else {
        pushToast({ title: "Error al enviar batch", description: res.error });
      }
    });
  }

  function syncBatch(id: string) {
    setBatchPending(true);
    void syncBrainBatchResultsAction(id).then((res) => {
      setBatchPending(false);
      if (res.success) {
        if (res.data.status !== "ended") {
          pushToast({
            title: "Batch en proceso",
            description: `Estado: ${res.data.status}. Intentá de nuevo en unos minutos.`,
          });
        } else {
          setBatchId(null);
          pushToast({
            title: "Resúmenes aplicados",
            description: `${res.data.processed} documentos actualizados.`,
            variant: "success",
          });
          router.refresh();
        }
      } else {
        pushToast({ title: "Error al sincronizar", description: res.error });
      }
    });
  }

  function process(id: string) {
    setProcessingIds((prev) => new Set(prev).add(id));
    void processAiBrainDocumentAction(id).then((res) => {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      if (res.success) {
        pushToast({
          title: "Procesado",
          description: `${res.data.charCount.toLocaleString("es-AR")} caracteres indexados.`,
          variant: "success",
        });
        router.refresh();
      } else {
        pushToast({ title: "Error al procesar", description: res.error });
      }
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
        <div className="flex items-center gap-2">
          {batchId ? (
            <Button
              size="sm"
              variant="outline"
              disabled={batchPending}
              onClick={() => syncBatch(batchId)}
            >
              {batchPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              )}
              Sincronizar resúmenes
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={batchPending}
              onClick={submitBatch}
            >
              {batchPending ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              )}
              Resumir con IA (batch)
            </Button>
          )}
          <Button asChild size="sm">
            <Link href={paths.superAdmin.aiBrain.add}>Añadir contenido</Link>
          </Button>
        </div>
      </div>

      <FilterPills
        options={TYPE_FILTERS.map(({ key, label }) => ({ value: key, label }))}
        value={filter}
        onChange={(value) => setFilter(value as BrainContentType | "all")}
      />
      <FilterPills
        options={STATUS_FILTERS.map(({ key, label }) => ({ value: key, label }))}
        value={statusFilter}
        onChange={(value) => setStatusFilter(value as BrainContentStatus | "all")}
      />

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
                {r.type !== "image" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    title="Procesar e indexar"
                    disabled={processingIds.has(r.id)}
                    onClick={() => process(r.id)}
                  >
                    <BrainCircuit className={`h-4 w-4 ${processingIds.has(r.id) ? "animate-pulse" : ""}`} />
                  </Button>
                )}
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

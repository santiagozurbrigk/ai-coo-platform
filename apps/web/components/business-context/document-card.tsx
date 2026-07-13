import Link from "next/link";
import { Badge, Button, cn } from "@ai-coo/ui";
import { FileSpreadsheet, FileText } from "lucide-react";
import { paths } from "@/routes";
import type { ContextDocument, DocumentStatus } from "@/types/business-context";

const CATEGORY_LABEL: Record<ContextDocument["category"], string> = {
  meetings: "Reuniones",
  frameworks: "Frameworks",
  training: "Training",
  sales: "Ventas",
  operations: "Operaciones",
};

const CATEGORY_CLASS: Record<ContextDocument["category"], string> = {
  meetings: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  frameworks: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
  training: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
  sales: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  operations: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
};

function StatusBadge({ status }: { status?: DocumentStatus }) {
  if (status === "indexed") {
    return (
      <Badge variant="success" className="text-[10px] shrink-0">
        Indexado
      </Badge>
    );
  }
  if (status === "processing") {
    return (
      <Badge variant="outline" className="text-[10px] shrink-0 border-amber-500/30 text-amber-700 dark:text-amber-400">
        Indexando…
      </Badge>
    );
  }
  if (status === "error") {
    return (
      <Badge variant="outline" className="text-[10px] shrink-0 border-destructive/40 text-destructive">
        Error
      </Badge>
    );
  }
  return null;
}

function StatusDot({ status }: { status?: DocumentStatus }) {
  if (status === "indexed") {
    return (
      <span
        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-emerald-500"
        title="Indexado"
      />
    );
  }
  if (status === "processing") {
    return (
      <span
        className="mt-1 h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500"
        title="Indexando…"
      />
    );
  }
  if (status === "error") {
    return (
      <span
        className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive"
        title="Error al indexar"
      />
    );
  }
  return <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/30" />;
}

export function DocumentCard({ document, listView = false }: { document: ContextDocument; listView?: boolean }) {
  if (listView) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3 transition-all duration-200 hover:border-border/70 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover">
        <StatusDot status={document.status} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">{document.title}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span>{document.updatedAt}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              {document.sourceType === "google_docs" ? (
                <FileText className="h-3 w-3 text-[#4285F4]" aria-hidden />
              ) : document.sourceType === "sheets" ? (
                <FileSpreadsheet className="h-3 w-3 text-[#0F9D58]" aria-hidden />
              ) : null}
              {document.source}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            CATEGORY_CLASS[document.category]
          )}
        >
          {CATEGORY_LABEL[document.category]}
        </span>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 shrink-0 px-3 text-[11px]"
        >
          <Link href={paths.platform.businessContext.viewer(document.id)}>
            Ver
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative flex h-[160px] flex-col gap-2 overflow-hidden rounded-xl border border-border/40 bg-muted/30 p-4 transition-all duration-200 hover:border-border/70 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <StatusDot status={document.status} />
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
            {document.title}
          </h3>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            CATEGORY_CLASS[document.category]
          )}
        >
          {CATEGORY_LABEL[document.category]}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span>{document.updatedAt}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          {document.sourceType === "google_docs" ? (
            <FileText className="h-3 w-3 text-[#4285F4]" aria-hidden />
          ) : document.sourceType === "sheets" ? (
            <FileSpreadsheet className="h-3 w-3 text-[#0F9D58]" aria-hidden />
          ) : null}
          {document.source}
        </span>
      </div>

      <p className="line-clamp-2 flex-1 text-[11px] leading-relaxed text-muted-foreground">
        {document.preview || document.summary}
      </p>

      <div className="mt-auto flex justify-end">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 px-3 text-[11px]"
        >
          <Link href={paths.platform.businessContext.viewer(document.id)}>
            Ver documento
          </Link>
        </Button>
      </div>
    </div>
  );
}

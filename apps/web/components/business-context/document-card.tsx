import Link from "next/link";
import { Badge, Button, cn } from "@ai-coo/ui";
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
  meetings: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  frameworks: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  training: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  sales: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  operations: "bg-amber-500/15 text-amber-300 border-amber-500/30",
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
      <Badge variant="outline" className="text-[10px] shrink-0 border-amber-500/30 text-amber-400">
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

export function DocumentCard({ document }: { document: ContextDocument }) {
  return (
    <div className="relative flex h-[160px] flex-col gap-2 overflow-hidden rounded-xl border border-border/40 bg-muted/30 p-4 transition-colors hover:border-border/70 dark:border-glass dark:bg-glass dark:backdrop-blur-md hover:dark:border-glass-strong hover:dark:bg-glass-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
          {document.title}
        </h3>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium",
              CATEGORY_CLASS[document.category]
            )}
          >
            {CATEGORY_LABEL[document.category]}
          </span>
          <StatusBadge status={document.status} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span>{document.updatedAt}</span>
        <span>·</span>
        <span>{document.source}</span>
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

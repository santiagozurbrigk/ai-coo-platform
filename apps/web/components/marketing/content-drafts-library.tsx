"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles, ExternalLink, ArrowRight } from "lucide-react";
import { Badge, cn } from "@ai-coo/ui";
import type { ContentDraftWithParent } from "@/app/marketing/content/actions";
import type { ContentBrief } from "@/types/content";
import { paths } from "@/routes";
import { FilterPills } from "@/components/marketing/filter-pills";
import {
  segmentedNavContainerClass,
  segmentedNavItemClass,
} from "@/components/shared/segmented-nav-styles";
import { EmptyState } from "@/components/shared/empty-state";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "reciente" | "antiguo";

const FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "reel", label: "Reels" },
  { value: "carousel", label: "Carruseles" },
  { value: "post", label: "Posts" },
  { value: "story", label: "Historias" },
  { value: "youtube", label: "YouTube" },
];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "reciente", label: "Más reciente" },
  { value: "antiguo", label: "Más antiguo" },
];

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  drafts: ContentDraftWithParent[];
};

export function ContentDraftsLibrary({ drafts }: Props) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("reciente");

  const filtered = useMemo(() => {
    let result = drafts;
    if (typeFilter !== "all") {
      result = result.filter((d) => d.type === typeFilter);
    }
    return [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortKey === "reciente" ? dateB - dateA : dateA - dateB;
    });
  }, [drafts, typeFilter, sortKey]);

  if (drafts.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6" aria-hidden />}
        title="Sin borradores todavía"
        description="Pedile al Agente de Negocio que cree variantes de una pieza de contenido. Aparecerán acá automáticamente."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          options={FILTER_OPTIONS}
          value={typeFilter}
          onChange={setTypeFilter}
        />
        <div className={segmentedNavContainerClass}>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSortKey(opt.value)}
              className={segmentedNavItemClass(sortKey === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      {filtered.length !== drafts.length ? (
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {drafts.length} borradores
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {drafts.length} {drafts.length === 1 ? "borrador" : "borradores"}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No hay borradores de tipo &quot;{FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((draft) => (
            <DraftCard key={draft.id} draft={draft} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Draft card ───────────────────────────────────────────────────────────────

function DraftCard({ draft }: { draft: ContentDraftWithParent }) {
  const brief = draft.brief as ContentBrief | null | undefined;

  const typeLabel: Record<string, string> = {
    reel: "Reel",
    story: "Historia",
    post: "Post",
    carousel: "Carrusel",
    youtube: "YouTube",
    brief: "Brief",
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" aria-hidden />
          Variante IA
        </span>
        <Badge variant="secondary" className="text-[11px]">
          {typeLabel[draft.type] ?? draft.type}
        </Badge>
        {draft.platform_post_id ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            Publicado
            {draft.platform_post_url ? (
              <a
                href={draft.platform_post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            ) : null}
          </span>
        ) : null}
        <span className="ml-auto text-[11px] text-muted-foreground" suppressHydrationWarning>
          {new Date(draft.created_at).toLocaleDateString("es-AR", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>

      {/* Brief chips */}
      {brief ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-blue-50/80 p-2 dark:bg-blue-950/30">
            <p className="text-[10px] text-muted-foreground">Formato</p>
            <p className="text-xs font-medium line-clamp-2">{brief.formato?.name}</p>
          </div>
          <div className="rounded-lg bg-orange-50/80 p-2 dark:bg-orange-950/30">
            <p className="text-[10px] text-muted-foreground">Dolor</p>
            <p className="text-xs font-medium line-clamp-2">{brief.dolor?.name}</p>
          </div>
          <div className="rounded-lg bg-primary/5 p-2">
            <p className="text-[10px] text-muted-foreground">Ángulo</p>
            <p className="text-xs font-medium line-clamp-2">{brief.angulo?.name}</p>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Sin brief generado.</p>
      )}

      {/* Structure preview — first section only */}
      {brief?.structure?.[0] ? (
        <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2">
          <p className="text-[10px] font-semibold text-primary mb-0.5">{brief.structure[0].part}</p>
          <p className="text-xs text-foreground/70 line-clamp-2">{brief.structure[0].description}</p>
        </div>
      ) : null}

      {/* Footer: pieza origen */}
      {draft.parent_piece ? (
        <div className="border-t border-border/40 pt-2">
          <p className="text-[10px] text-muted-foreground mb-1">Variante de</p>
          <Link
            href={paths.platform.marketing.contentDetail(draft.parent_piece.id)}
            className={cn(
              "inline-flex items-center gap-1 text-xs text-foreground/80 hover:text-primary transition-colors"
            )}
          >
            <span className="line-clamp-1">
              {draft.parent_piece.title ??
                draft.parent_piece.caption?.slice(0, 50) ??
                "Pieza sin título"}
            </span>
            <ArrowRight className="h-3 w-3 shrink-0" aria-hidden />
          </Link>
        </div>
      ) : null}
    </div>
  );
}

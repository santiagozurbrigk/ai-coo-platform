"use client";

import { Sparkles } from "lucide-react";
import { Badge, Input } from "@ai-coo/ui";
import type { GeneratedSop } from "@/types/sops";
import { SopMarkdownPreview } from "./sop-markdown-preview";

function formatDuration(minutes?: number): string {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export function SopGeneratedPreview({
  sop,
  editingTitle,
  onTitleChange,
  editingTags,
  onTagsChange,
}: {
  sop: GeneratedSop;
  editingTitle?: boolean;
  onTitleChange?: (title: string) => void;
  editingTags?: boolean;
  onTagsChange?: (tags: string[]) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 border-b border-border/40 pb-4 dark:border-white/[0.08]">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet-500/25 bg-violet-500/10">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Generado con IA
            </p>
            <Badge variant="outline" className="text-[10px] text-violet-700 dark:text-violet-300">
              Claude Sonnet
            </Badge>
          </div>
          {editingTitle && onTitleChange ? (
            <Input
              value={sop.title}
              onChange={(e) => onTitleChange(e.target.value)}
              className="mt-2"
            />
          ) : (
            <h3 className="mt-1 text-base font-medium leading-snug">{sop.title}</h3>
          )}
          {sop.summary ? (
            <p className="mt-2 text-sm text-muted-foreground">{sop.summary}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>
          Tiempo estimado:{" "}
          <strong className="text-foreground">
            {formatDuration(sop.estimatedDurationMinutes)}
          </strong>
        </span>
        {sop.stepsCount ? (
          <span>
            Pasos: <strong className="text-foreground">{sop.stepsCount}</strong>
          </span>
        ) : null}
      </div>

      {sop.tags.length > 0 || editingTags ? (
        <div className="flex flex-wrap gap-1.5">
          {(editingTags && onTagsChange
            ? sop.tags
            : sop.tags
          ).map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="outline" className="text-[10px]">
              {tag}
            </Badge>
          ))}
          {editingTags && onTagsChange ? (
            <Input
              placeholder="Agregar tag (Enter)"
              className="h-7 w-32 text-xs"
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (!value || sop.tags.includes(value)) return;
                onTagsChange([...sop.tags, value]);
                e.currentTarget.value = "";
              }}
            />
          ) : null}
        </div>
      ) : null}

      {sop.sections?.length ? (
        sop.sections.map((section) => (
          <section key={section.title}>
            <h4 className="mb-2 text-sm font-medium text-foreground">
              {section.title}
            </h4>
            <ul className="space-y-1.5">
              {section.items.map((item, index) => (
                <li
                  key={index}
                  className="text-sm leading-relaxed text-muted-foreground before:mr-2 before:text-violet-400 before:content-['•']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <SopMarkdownPreview content={sop.content} />
      )}
    </div>
  );
}

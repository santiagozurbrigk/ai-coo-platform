"use client";

import { useMemo, useState } from "react";
import { cn } from "@ai-coo/ui";
import { FilterPills } from "@/components/marketing/filter-pills";
import { CONVERSATION_TAG_FILTERS } from "@/constants/conversation-tags";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation, ConversationTagId } from "@/types/sales";
import { ConversationStatusBadge } from "./conversation-status-badge";
import { ConversationTagBadge } from "./conversation-tag-badge";
import {
  ConversationSourceBadge,
  CONVERSATION_SOURCE_FILTER_OPTIONS,
  getAvailableConversationSourceFilters,
  type ConversationSourceFilter,
} from "./conversation-source-badge";
import { LeadQualificationBadge } from "./lead-qualification-badge";

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const [tagFilter, setTagFilter] = useState<ConversationTagId | "all">("all");
  const [sourceFilter, setSourceFilter] =
    useState<ConversationSourceFilter>("all");

  const sourceFilterOptions = useMemo(
    () => getAvailableConversationSourceFilters(conversations),
    [conversations]
  );

  const sourcePills = useMemo(
    () =>
      CONVERSATION_SOURCE_FILTER_OPTIONS.filter((option) =>
        sourceFilterOptions.includes(option.value)
      ),
    [sourceFilterOptions]
  );

  const activeSourceFilter = sourceFilterOptions.includes(sourceFilter)
    ? sourceFilter
    : "all";

  const filtered = useMemo(() => {
    return conversations.filter((conversation) => {
      const tagMatches =
        tagFilter === "all" || conversation.tag === tagFilter;
      const source = conversation.source ?? "manychat";
      const sourceMatches =
        activeSourceFilter === "all" || source === activeSourceFilter;
      return tagMatches && sourceMatches;
    });
  }, [conversations, tagFilter, activeSourceFilter]);

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden border-r border-border bg-card">
      <div className="shrink-0 border-b border-border px-[var(--space-card-sm)] py-[var(--space-card-sm)] space-y-[var(--space-card-sm)]">
        <p className="px-1 text-caption font-medium text-muted-foreground">
          {filtered.length} conversaciones
        </p>
        {sourcePills.length > 1 ? (
          <FilterPills
            options={sourcePills.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            value={activeSourceFilter}
            onChange={(value) =>
              setSourceFilter(value as ConversationSourceFilter)
            }
          />
        ) : null}
        <FilterPills
          options={CONVERSATION_TAG_FILTERS.map((f) => ({
            value: f.id,
            label: f.label,
          }))}
          value={tagFilter}
          onChange={(value) => setTagFilter(value as typeof tagFilter)}
        />
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {filtered.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className={cn(
                "w-full border-b border-border px-[var(--space-card-sm)] py-[var(--space-card-sm)] text-left transition-colors hover:bg-muted/50",
                selectedId === c.id &&
                  "border-l-2 border-l-primary bg-muted/60"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span className="truncate text-sm font-medium">{c.leadName}</span>
                  <ConversationSourceBadge
                    source={c.source}
                    showLabel={false}
                    className="shrink-0"
                  />
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {c.analysis.qualificationScore ? (
                    <LeadQualificationBadge
                      score={c.analysis.qualificationScore}
                      compact
                    />
                  ) : null}
                  {c.unread ? (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  ) : null}
                </div>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {c.lastMessage}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {c.tag && <ConversationTagBadge tag={c.tag} />}
                <ConversationStatusBadge status={c.status} />
                <span className="ml-auto text-2xs text-muted-foreground/80">
                  {formatRelativeTime(c.lastMessageAt)}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

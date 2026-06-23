"use client";

import { useState } from "react";
import { cn } from "@ai-coo/ui";
import { FilterPills } from "@/components/marketing/filter-pills";
import { CONVERSATION_TAG_FILTERS } from "@/constants/conversation-tags";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation, ConversationTagId } from "@/types/sales";
import { ConversationStatusBadge } from "./conversation-status-badge";
import { ConversationTagBadge } from "./conversation-tag-badge";
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

  const filtered =
    tagFilter === "all"
      ? conversations
      : conversations.filter((c) => c.tag === tagFilter);

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden border-r border-border bg-card">
      <div className="shrink-0 border-b border-border px-[var(--space-card-sm)] py-[var(--space-card-sm)] space-y-[var(--space-card-sm)]">
        <p className="px-1 text-caption font-medium text-muted-foreground">
          {filtered.length} conversaciones
        </p>
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
                <span className="truncate text-sm font-medium">{c.leadName}</span>
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
                {c.source === "instagram" && (
                  <span className="rounded-[var(--radius-pill)] border border-pink-500/20 bg-pink-900/20 px-1.5 py-0.5 text-micro text-pink-400">
                    IG DM
                  </span>
                )}
                {c.source === "manychat" && (
                  <span className="rounded-[var(--radius-pill)] border border-green-500/20 bg-green-900/20 px-1.5 py-0.5 text-micro text-green-400">
                    ManyChat
                  </span>
                )}
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

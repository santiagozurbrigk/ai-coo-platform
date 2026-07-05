"use client";

import { useMemo, useState } from "react";
import { cn, StaggerFade, StaggerFadeItem } from "@ai-coo/ui";
import { FilterPills } from "@/components/marketing/filter-pills";
import { CONVERSATION_TAG_FILTERS } from "@/constants/conversation-tags";
import { formatRelativeTime } from "@/lib/format";
import type { Conversation, ConversationTagId } from "@/types/sales";
import { ConversationStatusBadge } from "./conversation-status-badge";
import { ConversationTagBadge } from "./conversation-tag-badge";
import { ConversationSourceBadge } from "./conversation-source-badge";
import { LeadAvatar } from "./lead-avatar";
import { LeadQualificationBadge } from "./lead-qualification-badge";

type InboxChannel = "instagram" | "whatsapp";

const INBOX_CHANNEL_OPTIONS: { value: InboxChannel; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
];

function pickDefaultChannel(conversations: Conversation[]): InboxChannel {
  const instagramCount = conversations.filter(
    (c) => c.source === "instagram"
  ).length;
  const whatsappCount = conversations.filter(
    (c) => c.source === "whatsapp"
  ).length;

  if (whatsappCount > instagramCount) return "whatsapp";
  return "instagram";
}

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
  const [channelFilter, setChannelFilter] = useState<InboxChannel | null>(
    null
  );

  const activeChannel = channelFilter ?? pickDefaultChannel(conversations);

  const filtered = useMemo(() => {
    return conversations.filter((conversation) => {
      const source = conversation.source;
      if (source !== "instagram" && source !== "whatsapp") return false;

      const tagMatches =
        tagFilter === "all" || conversation.tag === tagFilter;
      const sourceMatches = source === activeChannel;
      return tagMatches && sourceMatches;
    });
  }, [conversations, tagFilter, activeChannel]);

  return (
    <div className="flex h-full min-w-0 w-full flex-col overflow-hidden border-r border-border bg-card">
      <div className="shrink-0 border-b border-border px-[var(--space-card-sm)] py-[var(--space-card-sm)] space-y-[var(--space-card-sm)]">
        <p className="px-1 text-caption font-medium text-muted-foreground">
          {filtered.length} conversaciones
        </p>
        <FilterPills
          options={INBOX_CHANNEL_OPTIONS}
          value={activeChannel}
          onChange={(value) => setChannelFilter(value as InboxChannel)}
        />
        <select
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
          value={tagFilter}
          onChange={(event) =>
            setTagFilter(event.target.value as typeof tagFilter)
          }
          aria-label="Filtrar por etiqueta"
        >
          {CONVERSATION_TAG_FILTERS.map((filter) => (
            <option key={filter.id} value={filter.id}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>
      <StaggerFade as="ul" className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        {filtered.map((c) => (
          <StaggerFadeItem as="li" key={c.id}>
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
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <LeadAvatar
                    name={c.leadName}
                    attendeeId={c.leadUnipileAttendeeId}
                    accountId={c.unipileAccountId}
                    className="h-8 w-8"
                  />
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {c.leadName}
                    </span>
                    <ConversationSourceBadge
                      source={c.source}
                      showLabel={false}
                      className="shrink-0"
                    />
                  </div>
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
              <p className="mt-0.5 truncate pl-10 text-xs text-muted-foreground">
                {c.lastMessage}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2 pl-10">
                {c.tag && <ConversationTagBadge tag={c.tag} />}
                <ConversationStatusBadge status={c.status} />
                <span className="ml-auto text-2xs text-muted-foreground/80">
                  {formatRelativeTime(c.lastMessageAt)}
                </span>
              </div>
            </button>
          </StaggerFadeItem>
        ))}
      </StaggerFade>
    </div>
  );
}

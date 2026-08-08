"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getZernioAnalysisBatchAction,
  getZernioIntegrationStatusAction,
  getZernioMessagesAction,
  listZernioConversationsAction,
  sendZernioMessageAction,
  type ZernioAnalysisSummary,
  type ZernioConversationWithAccount,
} from "@/app/integrations/zernio/actions";
import type { ZernioMessage } from "@/lib/zernio/client";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/page-loading";
import { FilterPills } from "@/components/marketing/filter-pills";
import {
  segmentedNavContainerClass,
  segmentedNavItemClass,
} from "@/components/shared/segmented-nav-styles";
import { paths } from "@/routes";
import { Badge, Button, Input, cn } from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import { Search } from "lucide-react";
import { ZernioSidePanel } from "./zernio-side-panel";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-[#E4405F]/15 text-[#E4405F]",
  facebook: "bg-[#1877F2]/15 text-[#1877F2]",
  whatsapp: "bg-[#25D366]/15 text-[#25D366]",
  telegram: "bg-[#229ED9]/15 text-[#229ED9]",
  twitter: "bg-foreground/10 text-foreground",
  linkedin: "bg-[#0A66C2]/15 text-[#0A66C2]",
  youtube: "bg-[#FF0000]/15 text-[#FF0000]",
  tiktok: "bg-foreground/10 text-foreground",
};

const TAG_CONFIG: Record<string, { label: string; className: string }> = {
  caliente: { label: "🔥 Caliente", className: "bg-red-500/15 text-red-500" },
  tibio: { label: "🌡 Tibio", className: "bg-orange-500/15 text-orange-500" },
  frio: { label: "❄️ Frío", className: "bg-blue-500/15 text-blue-500" },
  agendado: { label: "✅ Agendado", className: "bg-green-500/15 text-green-500" },
  no_interesado: {
    label: "✗ No interesado",
    className: "bg-muted text-muted-foreground",
  },
};

function conversationTitle(conversation: ZernioConversationWithAccount): string {
  return conversation.participantName || "Contacto";
}

function conversationAvatar(conversation: ZernioConversationWithAccount): string | null {
  return conversation.participantPicture ?? null;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} sem`;
  const months = Math.floor(days / 30);
  return `${months} mes`;
}

type PlatformFilter = "all" | "instagram" | "whatsapp";
type InboxStatusFilter = "all" | "unread" | "archived";

const PLATFORM_FILTERS: { value: PlatformFilter; label: string; dotClass?: string }[] =
  [
    { value: "instagram", label: "Instagram", dotClass: "bg-[#E4405F]" },
    { value: "whatsapp", label: "WhatsApp", dotClass: "bg-[#25D366]" },
    { value: "all", label: "Todos" },
  ];

const STATUS_FILTERS: { value: InboxStatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "unread", label: "No leídos" },
  { value: "archived", label: "Archivados" },
];

function ConversationAvatar({
  src,
  name,
}: {
  src: string | null;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  const initial = name.slice(0, 1).toUpperCase();

  if (!src || failed) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {initial}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className="h-9 w-9 shrink-0 rounded-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function ZernioInboxPanel() {
  const { push } = useToast();
  const hasAutoSelected = useRef(false);
  const [hasIntegration, setHasIntegration] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState<ZernioConversationWithAccount[]>([]);
  const [analysisMap, setAnalysisMap] = useState<Record<string, ZernioAnalysisSummary>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ZernioMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [statusFilter, setStatusFilter] = useState<InboxStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return conversations.filter((conversation) => {
      const platform = conversation.platform.toLowerCase();
      if (platformFilter !== "all" && platform !== platformFilter) return false;
      if (statusFilter === "unread" && !(conversation.unreadCount > 0)) return false;
      if (statusFilter === "archived" && conversation.status !== "archived") {
        return false;
      }
      if (query) {
        const title = conversationTitle(conversation).toLowerCase();
        const lastMessage = (conversation.lastMessage ?? "").toLowerCase();
        if (!title.includes(query) && !lastMessage.includes(query)) return false;
      }
      return true;
    });
  }, [conversations, platformFilter, statusFilter, searchQuery]);

  useEffect(() => {
    setSelectedId((current) => {
      if (current && filteredConversations.some((c) => c.id === current)) {
        return current;
      }
      return filteredConversations[0]?.id ?? null;
    });
  }, [filteredConversations]);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const status = await getZernioIntegrationStatusAction();
      setHasIntegration(status.connected || Boolean(status.profileId));
      const list = await listZernioConversationsAction();
      setConversations(list);
      if (list.length > 0) {
        const batch = await getZernioAnalysisBatchAction(list.map((c) => c.id));
        setAnalysisMap(batch);
      }
      if (!hasAutoSelected.current && list[0]) {
        setSelectedId(list[0].id);
        hasAutoSelected.current = true;
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    const conversation = conversations.find((c) => c.id === selectedId);
    if (!conversation?.accountId) {
      setMessages([]);
      return;
    }

    let cancelled = false;
    const accountId = conversation.accountId;
    const conversationId = selectedId;

    async function loadMessages(showLoader: boolean) {
      if (showLoader) setMessagesLoading(true);
      try {
        const list = await getZernioMessagesAction(conversationId, accountId);
        if (!cancelled) setMessages(list);
      } catch (err) {
        if (!cancelled && showLoader) {
          push({
            title: "Error al cargar mensajes",
            description: err instanceof Error ? err.message : "Error desconocido",
          });
        }
      } finally {
        if (!cancelled && showLoader) setMessagesLoading(false);
      }
    }

    void loadMessages(true);

    // Polling cada 30 s para mostrar nuevos mensajes sin necesidad de F5
    const interval = setInterval(() => void loadMessages(false), 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedId, conversations, push]);

  const selected = conversations.find((c) => c.id === selectedId);

  const handleAnalysisUpdated = useCallback(
    (conversationId: string, summary: ZernioAnalysisSummary) => {
      setAnalysisMap((prev) => ({ ...prev, [conversationId]: summary }));
    },
    []
  );

  async function handleSend() {
    if (!selectedId || !selected?.accountId || !draft.trim()) return;
    const text = draft.trim();
    setSending(true);
    setDraft("");

    const optimisticMsg: ZernioMessage = {
      id: `optimistic-${Date.now()}`,
      conversationId: selectedId,
      text,
      direction: "outbound",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await sendZernioMessageAction(selectedId, text, selected.accountId);
      void getZernioMessagesAction(selectedId, selected.accountId)
        .then(setMessages)
        .catch(() => null);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setDraft(text);
      push({
        title: "No se pudo enviar",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <PageLoading label="Cargando redes sociales…" className="flex-1" />;
  }

  if (!hasIntegration) {
    return (
      <EmptyState
        title="Conectá Zernio"
        description="Vinculá Instagram, Facebook, WhatsApp y más para ver DMs en esta sección."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href={paths.platform.integrations}>Conectar Zernio</Link>
          </Button>
        }
        className="flex-1"
      />
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        title="Sin conversaciones en redes"
        description="Cuando lleguen DMs desde Zernio, aparecerán acá."
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href={paths.platform.integrations}>Gestionar Zernio</Link>
          </Button>
        }
        className="flex-1"
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 overflow-hidden">
      <div className="hidden h-full w-[280px] shrink-0 flex-col overflow-hidden border-r border-border md:flex">
        <div className="space-y-3 border-b border-border p-3">
          <div className={segmentedNavContainerClass}>
            {PLATFORM_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPlatformFilter(option.value)}
                className={cn(
                  segmentedNavItemClass(platformFilter === option.value),
                  "inline-flex items-center gap-1.5"
                )}
              >
                {option.dotClass ? (
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full", option.dotClass)}
                    aria-hidden
                  />
                ) : null}
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar conversación..."
              className="h-8 pl-8 text-sm"
            />
          </div>

          <FilterPills
            options={STATUS_FILTERS}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as InboxStatusFilter)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              No hay conversaciones con estos filtros.
            </p>
          ) : (
            filteredConversations.map((conversation) => {
          const platformClass =
            PLATFORM_COLORS[conversation.platform.toLowerCase()] ??
            "bg-muted text-muted-foreground";
          const tag = analysisMap[conversation.id]?.ai_tag;
          const tagConfig = tag ? TAG_CONFIG[tag] : null;

          const isUnread = conversation.unreadCount > 0;

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedId(conversation.id)}
              className={cn(
                "relative flex w-full items-start gap-3 border-b border-border/40 px-3 py-3 text-left transition-colors hover:bg-muted/40",
                selectedId === conversation.id
                  ? "bg-muted/60"
                  : isUnread && "bg-primary/[0.03]"
              )}
            >
              {/* Unread indicator */}
              {isUnread && selectedId !== conversation.id && (
                <span
                  aria-label="No leído"
                  className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
                />
              )}
              <div className="relative shrink-0">
                <ConversationAvatar
                  src={conversationAvatar(conversation)}
                  name={conversationTitle(conversation)}
                />
                {isUnread && (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className={cn("truncate text-sm", isUnread ? "font-semibold" : "font-medium")}>
                    {conversationTitle(conversation)}
                  </p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {relativeTime(conversation.updatedTime)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge className={cn("shrink-0 text-[10px] capitalize", platformClass)}>
                    {conversation.platform}
                  </Badge>
                  {tagConfig && (
                    <span
                      className={cn(
                        "inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                        tagConfig.className
                      )}
                    >
                      {tagConfig.label}
                    </span>
                  )}
                  {isUnread && (
                    <span className="ml-auto shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                <p className={cn("mt-0.5 line-clamp-1 text-xs", isUnread ? "text-foreground/80" : "text-muted-foreground")}>
                  {conversation.lastMessage ?? "Sin mensajes"}
                </p>
              </div>
            </button>
          );
            })
          )}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {selected ? (
          <>
            <div className="border-b border-border px-4 py-3">
              <p className="font-medium">{conversationTitle(selected)}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {selected.platform}
              </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messagesLoading ? (
                <p className="text-sm text-muted-foreground">Cargando mensajes…</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "max-w-[72%] rounded-xl px-3 py-1.5 text-[13px] shadow-sm",
                      message.direction === "outbound"
                        ? "ml-auto rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    )}
                  >
                    <p className="leading-snug">{message.text ?? "[Sin texto]"}</p>
                    <p className="mt-1 text-[10px] opacity-60">
                      {relativeTime(message.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 border-t border-border p-3">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribí un mensaje…"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleSend();
                  }
                }}
              />
              <Button
                type="button"
                disabled={sending || !draft.trim()}
                onClick={() => void handleSend()}
              >
                Enviar
              </Button>
            </div>
          </>
        ) : (
          <EmptyState
            title="Seleccioná una conversación"
            description="Elegí un chat de la lista para ver los mensajes."
            className="flex-1"
          />
        )}
      </div>

      <div className="hidden h-full w-[240px] min-w-[240px] shrink-0 overflow-y-auto border-l border-border bg-card lg:block">
        {selected ? (
          <ZernioSidePanel
            conversation={selected}
            messages={messages}
            savedAnalysis={analysisMap[selected.id]}
            onAnalysisUpdated={handleAnalysisUpdated}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4">
            <p className="text-center text-xs text-muted-foreground">
              Seleccioná una conversación para ver el análisis IA
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

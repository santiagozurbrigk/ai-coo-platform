"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getZernioIntegrationStatusAction,
  getZernioMessagesAction,
  listZernioConversationsAction,
  sendZernioMessageAction,
  type ZernioConversationWithAccount,
} from "@/app/integrations/zernio/actions";
import type { ZernioMessage } from "@/lib/zernio/client";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/page-loading";
import { paths } from "@/routes";
import {
  Badge,
  Button,
  Input,
  cn,
} from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";

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

function conversationTitle(conversation: ZernioConversationWithAccount): string {
  return conversation.participantName || "Contacto";
}

function conversationAvatar(conversation: ZernioConversationWithAccount): string | null {
  return conversation.participantPicture ?? null;
}

export function ZernioInboxPanel() {
  const { push } = useToast();
  const [hasIntegration, setHasIntegration] = useState<boolean | null>(null);
  const [conversations, setConversations] = useState<ZernioConversationWithAccount[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ZernioMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const status = await getZernioIntegrationStatusAction();
      setHasIntegration(status.connected || Boolean(status.profileId));
      const list = await listZernioConversationsAction();
      setConversations(list);
      if (!selectedId && list[0]) {
        setSelectedId(list[0].id);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

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
    setMessagesLoading(true);
    void getZernioMessagesAction(selectedId, conversation.accountId)
      .then((list) => {
        if (!cancelled) setMessages(list);
      })
      .catch((err) => {
        if (!cancelled) {
          push({
            title: "Error al cargar mensajes",
            description: err instanceof Error ? err.message : "Error desconocido",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId, conversations, push]);

  const selected = conversations.find((c) => c.id === selectedId);

  async function handleSend() {
    if (!selectedId || !draft.trim()) return;
    setSending(true);
    try {
      await sendZernioMessageAction(selectedId, draft.trim());
      setDraft("");
      const list = await getZernioMessagesAction(selectedId);
      setMessages(list);
      await loadConversations();
    } catch (err) {
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
      <div className="hidden h-full w-[280px] shrink-0 flex-col overflow-y-auto border-r border-border md:flex">
        {conversations.map((conversation) => {
          const avatar = conversationAvatar(conversation);
          const platformClass =
            PLATFORM_COLORS[conversation.platform.toLowerCase()] ??
            "bg-muted text-muted-foreground";

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => setSelectedId(conversation.id)}
              className={cn(
                "flex w-full items-start gap-3 border-b border-border/50 px-3 py-3 text-left transition-colors hover:bg-muted/40",
                selectedId === conversation.id && "bg-muted/60"
              )}
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {conversationTitle(conversation).slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium">
                    {conversationTitle(conversation)}
                  </p>
                  <Badge className={cn("shrink-0 text-[10px] capitalize", platformClass)}>
                    {conversation.platform}
                  </Badge>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {conversation.lastMessage ?? "Sin mensajes"}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(conversation.updatedTime).toLocaleString("es")}
                </p>
              </div>
            </button>
          );
        })}
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
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      message.direction === "outbound"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p>{message.text ?? "[Sin texto]"}</p>
                    <p className="mt-1 text-[10px] opacity-70">
                      {new Date(message.createdAt).toLocaleString("es")}
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
    </div>
  );
}

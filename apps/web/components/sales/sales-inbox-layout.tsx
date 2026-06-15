"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { List, MessageCircle } from "lucide-react";
import { Button, Dialog, DialogContent, DialogTitle } from "@ai-coo/ui";
import { usePlatformData } from "@/providers";
import { paths } from "@/routes";
import type { ConversationTagId } from "@/types/sales";
import { ConversationList } from "./conversation-list";
import { ConversationThread } from "./conversation-thread";
import { ConversationAnalysisPanel } from "./conversation-analysis";
import { LeadJourneyInline } from "./lead-journey-inline";
import { EmptyState } from "@/components/shared/empty-state";

export function SalesInboxLayout() {
  const searchParams = useSearchParams();
  const deepLinkId = searchParams.get("c") ?? undefined;
  const { conversations, conversationsLoading, setConversationTag } =
    usePlatformData();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedId(undefined);
      return;
    }
    if (deepLinkId && conversations.some((c) => c.id === deepLinkId)) {
      setSelectedId(deepLinkId);
      return;
    }
    if (!selectedId || !conversations.some((c) => c.id === selectedId)) {
      setSelectedId(conversations[0]?.id);
    }
  }, [conversations, selectedId, deepLinkId]);

  const selected = conversations.find((c) => c.id === selectedId);

  if (conversationsLoading && conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] min-h-[480px] items-center justify-center rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
        Cargando conversaciones…
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] min-h-[480px] items-center justify-center rounded-xl border border-border bg-card">
        <EmptyState
          title="Sin conversaciones todavía"
          description="Conectá ManyChat o Instagram para empezar a recibir conversaciones de tus leads aquí."
          icon={<MessageCircle className="h-8 w-8" />}
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href={paths.platform.integrations}>Conectar integración</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setListOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[480px] flex-col overflow-hidden rounded-xl border border-border bg-card md:flex-row">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2 md:hidden">
        <Dialog open={listOpen} onOpenChange={setListOpen}>
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="gap-2"
            onClick={() => setListOpen(true)}
          >
            <List className="h-4 w-4" />
            Conversaciones ({conversations.length})
          </Button>
          <DialogContent className="left-0 top-0 h-full max-h-full w-[280px] max-w-[280px] translate-x-0 translate-y-0 rounded-none border-r p-0">
            <DialogTitle className="sr-only">Lista de conversaciones</DialogTitle>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="hidden h-full min-w-0 w-[280px] max-w-[280px] shrink-0 overflow-hidden md:flex">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden md:border-r md:border-white/[0.06]">
        {selected ? (
          <>
            <ConversationThread
              conversation={selected}
              onTagChange={(tag: ConversationTagId) => {
                void setConversationTag(selected.id, tag);
              }}
            />
            <LeadJourneyInline
              conversationId={selected.id}
              leadName={selected.leadName}
            />
          </>
        ) : (
          <EmptyState
            title="Selecciona una conversación"
            description="Elige un lead en la lista para ver mensajes, recorrido de contenido y análisis."
            className="m-4 flex-1"
          />
        )}
      </div>

      <div className="hidden h-full w-[240px] min-w-[240px] max-w-[280px] shrink-0 overflow-y-auto overflow-x-hidden border-l border-border bg-card md:block lg:w-[280px] lg:min-w-[280px]">
        {selected && <ConversationAnalysisPanel conversation={selected} />}
      </div>
    </div>
  );
}

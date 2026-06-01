"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { Button, Dialog, DialogContent, DialogTitle, cn } from "@ai-coo/ui";
import { getLeadJourneyByLeadName } from "@/mocks/marketing-insights";
import { usePlatformData } from "@/providers";
import type { ConversationTagId } from "@/types/sales";
import { ConversationList } from "./conversation-list";
import { ConversationThread } from "./conversation-thread";
import { ConversationAnalysisPanel } from "./conversation-analysis";
import { LeadJourneyInline } from "./lead-journey-inline";
import { EmptyState } from "@/components/shared/empty-state";

export function SalesInboxLayout() {
  const { conversations, conversationsLoading, setConversationTag } =
    usePlatformData();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [listOpen, setListOpen] = useState(false);

  useEffect(() => {
    if (conversations.length === 0) {
      setSelectedId(undefined);
      return;
    }
    if (!selectedId || !conversations.some((c) => c.id === selectedId)) {
      setSelectedId(conversations[0]?.id);
    }
  }, [conversations, selectedId]);

  const selected = conversations.find((c) => c.id === selectedId);

  if (conversationsLoading && conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-8rem)] min-h-[480px] items-center justify-center rounded-xl border border-border bg-muted/30 text-sm text-muted-foreground">
        Cargando conversaciones…
      </div>
    );
  }
  const journey = selected
    ? getLeadJourneyByLeadName(selected.leadName)
    : undefined;

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setListOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[480px] flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] md:flex-row">
      <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] px-3 py-2 md:hidden">
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
            {journey && <LeadJourneyInline journey={journey} />}
          </>
        ) : (
          <EmptyState
            title="Selecciona una conversación"
            description="Elige un lead en la lista para ver mensajes, recorrido de contenido y análisis."
            className="m-4 flex-1"
          />
        )}
      </div>

      <div className="hidden h-full w-[280px] min-w-[280px] max-w-[280px] shrink-0 overflow-y-auto overflow-x-hidden bg-white/[0.02] lg:block">
        {selected && <ConversationAnalysisPanel analysis={selected.analysis} />}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { List } from "lucide-react";
import { Button, Dialog, DialogContent, DialogTitle, cn } from "@ai-coo/ui";
import type { Conversation } from "@/types/sales";
import { ConversationList } from "./conversation-list";
import { ConversationThread } from "./conversation-thread";
import { ConversationAnalysisPanel } from "./conversation-analysis";
import { EmptyState } from "@/components/shared";

export function SalesInboxLayout({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [selectedId, setSelectedId] = useState(conversations[0]?.id);
  const [listOpen, setListOpen] = useState(false);
  const selected = conversations.find((c) => c.id === selectedId);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setListOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-[480px] flex-col overflow-hidden rounded-xl border border-border bg-card/20 md:flex-row">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2 md:hidden">
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

      <div className="hidden h-full w-full max-w-[280px] shrink-0 md:flex">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col md:border-r md:border-border")}>
        {selected ? (
          <ConversationThread conversation={selected} />
        ) : (
          <EmptyState
            title="Selecciona una conversación"
            description="Elige un lead en la lista para ver mensajes y análisis."
            className="m-4 flex-1"
          />
        )}
      </div>

      <div className="hidden h-full w-[280px] shrink-0 overflow-y-auto bg-card/30 lg:block">
        {selected && <ConversationAnalysisPanel analysis={selected.analysis} />}
      </div>
    </div>
  );
}

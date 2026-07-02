"use client";

import { useEffect } from "react";
import { getOrganizationIdAction } from "@/app/conversations/actions";
import {
  mapDocumentRowToContextDocument,
  type BusinessContextDocumentRow,
} from "@/lib/business-context/types";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ContextDocument } from "@/types/business-context";

function applyDocumentRowUpdate(
  row: BusinessContextDocumentRow
): ContextDocument | null {
  if (row.status === "processing") return null;
  return mapDocumentRowToContextDocument(row);
}

export function useBusinessContextDocumentsRealtime(
  setDocuments: React.Dispatch<React.SetStateAction<ContextDocument[]>>
) {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let cancelled = false;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void (async () => {
      const organizationId = await getOrganizationIdAction();
      if (!organizationId || cancelled) return;

      const nextChannel = supabase
        .channel(`business-context-docs:org:${organizationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "business_context_documents",
            filter: `organization_id=eq.${organizationId}`,
          },
          (payload) => {
            const mapped = mapDocumentRowToContextDocument(
              payload.new as BusinessContextDocumentRow
            );
            setDocuments((prev) => {
              if (prev.some((doc) => doc.id === mapped.id)) return prev;
              return [mapped, ...prev];
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "business_context_documents",
            filter: `organization_id=eq.${organizationId}`,
          },
          (payload) => {
            const row = payload.new as BusinessContextDocumentRow;
            const mapped = applyDocumentRowUpdate(row);
            if (!mapped) return;

            setDocuments((prev) => {
              const idx = prev.findIndex((doc) => doc.id === row.id);
              if (idx === -1) return prev;
              const next = [...prev];
              next[idx] = mapped;
              return next;
            });
          }
        );

      channel = nextChannel;

      if (cancelled) {
        void supabase.removeChannel(nextChannel);
        channel = null;
        return;
      }

      nextChannel.subscribe((status, err) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(
            "[BusinessContext] documents realtime",
            status,
            err
          );
        }
      });
    })();

    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [setDocuments]);
}

export function useBusinessContextDocumentRealtime(
  documentId: string,
  setDocument: React.Dispatch<React.SetStateAction<ContextDocument>>
) {
  useEffect(() => {
    if (!isSupabaseConfigured() || !documentId) return;

    let cancelled = false;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void (async () => {
      const organizationId = await getOrganizationIdAction();
      if (!organizationId || cancelled) return;

      const nextChannel = supabase
        .channel(`business-context-doc:${documentId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "business_context_documents",
            filter: `id=eq.${documentId}`,
          },
          (payload) => {
            const row = payload.new as BusinessContextDocumentRow;
            if (row.organization_id !== organizationId) return;

            const mapped = applyDocumentRowUpdate(row);
            if (!mapped) return;

            setDocument(mapped);
          }
        );

      channel = nextChannel;

      if (cancelled) {
        void supabase.removeChannel(nextChannel);
        channel = null;
        return;
      }

      nextChannel.subscribe((status, err) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.error(
            "[BusinessContext] document realtime",
            documentId,
            status,
            err
          );
        }
      });
    })();

    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [documentId, setDocument]);
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mockClosingCalls } from "@/mocks/closing";
import { mockClients } from "@/mocks/clients";
import { mockConversations } from "@/mocks/sales";
import type { Client, ClientStatus } from "@/types/clients";
import type {
  ClosePaymentPayload,
  ClosingCall,
  NoCloseReasonId,
} from "@/types/closing";
import type { Conversation, ConversationTagId } from "@/types/sales";
import type { CustomRole } from "@/types/team";

type PlatformDataContextValue = {
  conversations: Conversation[];
  setConversationTag: (conversationId: string, tag: ConversationTagId | null) => void;
  setConversationTagByLeadName: (leadName: string, tag: ConversationTagId) => void;
  closingCalls: ClosingCall[];
  updateClosingCall: (id: string, patch: Partial<ClosingCall>) => void;
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, patch: Partial<Client>) => void;
  customRoles: CustomRole[];
  addCustomRole: (role: CustomRole) => void;
  markCallClosed: (callId: string, payment: ClosePaymentPayload) => Client;
  markCallNotClosed: (callId: string, reason: NoCloseReasonId, notes?: string) => void;
  markCallNoShow: (callId: string) => void;
};

const PlatformDataContext = createContext<PlatformDataContextValue | null>(null);

function findConversationByLead(
  conversations: Conversation[],
  leadName: string
): Conversation | undefined {
  return conversations.find(
    (c) => c.leadName.toLowerCase() === leadName.toLowerCase()
  );
}

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(
    () => mockConversations.map((c) => ({ ...c }))
  );
  const [closingCalls, setClosingCalls] = useState<ClosingCall[]>(
    () => mockClosingCalls.map((c) => ({ ...c }))
  );
  const [clients, setClients] = useState<Client[]>(() =>
    mockClients.map((c) => ({ ...c }))
  );
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);

  const setConversationTag = useCallback(
    (conversationId: string, tag: ConversationTagId | null) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, tag } : c))
      );
    },
    []
  );

  const setConversationTagByLeadName = useCallback(
    (leadName: string, tag: ConversationTagId) => {
      const conv = findConversationByLead(conversations, leadName);
      if (conv) setConversationTag(conv.id, tag);
      else {
        setConversations((prev) => {
          const match = findConversationByLead(prev, leadName);
          if (!match) return prev;
          return prev.map((c) =>
            c.leadName.toLowerCase() === leadName.toLowerCase()
              ? { ...c, tag }
              : c
          );
        });
      }
    },
    [conversations, setConversationTag]
  );

  const updateClosingCall = useCallback((id: string, patch: Partial<ClosingCall>) => {
    setClosingCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }, []);

  const addClient = useCallback((client: Client) => {
    setClients((prev) => {
      if (prev.some((c) => c.id === client.id)) {
        return prev.map((c) => (c.id === client.id ? client : c));
      }
      return [client, ...prev];
    });
  }, []);

  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }, []);

  const addCustomRole = useCallback((role: CustomRole) => {
    setCustomRoles((prev) => [...prev, role]);
  }, []);

  const markCallClosed = useCallback(
    (callId: string, payment: ClosePaymentPayload): Client => {
      const call = closingCalls.find((c) => c.id === callId);
      const revenue =
        payment.paymentType === "upfront"
          ? payment.totalAmount ?? 0
          : payment.paymentType === "installments"
            ? (payment.installmentAmount ?? 0) *
              (payment.installmentCount ?? 1)
            : (payment.upfrontAmount ?? 0) + (payment.feeAmount ?? 0);

      updateClosingCall(callId, {
        status: "closed",
        outcome: {
          paymentType: payment.paymentType,
          revenue,
        },
        fathomUrl: payment.fathomUrl ?? call?.fathomUrl,
        closedByName: payment.closedByName ?? "Martín López",
        paymentSourcePlatformId: payment.paymentSourcePlatformId,
        paymentDestinationPlatformId: payment.paymentDestinationPlatformId,
      });

      if (call) {
        setConversations((prev) =>
          prev.map((c) => {
            const match =
              c.id === call.conversationId ||
              c.leadName.toLowerCase() === call.leadName.toLowerCase();
            return match ? { ...c, tag: "closeado" as ConversationTagId } : c;
          })
        );
      }

      const clientId = `client-${callId}`;
      const installments =
        payment.paymentType === "installments" && payment.installmentCount
          ? Array.from({ length: payment.installmentCount }, (_, i) => ({
              id: `${clientId}-inst-${i + 1}`,
              label: `Cuota ${i + 1}`,
              amount: payment.installmentAmount ?? 0,
              status: (i === 0 ? "paid" : "pending") as "paid" | "pending",
              dueDate:
                i === 0
                  ? payment.firstInstallmentDate
                  : undefined,
              proofLabel: i === 0 ? "comprobante-inicial.pdf" : undefined,
            }))
          : undefined;

      const newClient: Client = {
        id: clientId,
        name: payment.clientName,
        joinDate: new Date().toISOString().slice(0, 10),
        paymentType: payment.paymentType,
        platform: payment.platform,
        totalAmount: revenue,
        upfrontAmount: payment.upfrontAmount,
        feeAmount: payment.feeAmount,
        feeFrequency: payment.feeFrequency,
        status: "pending_onboarding",
        isSuccessCase: false,
        installments,
        salesFathomUrl: payment.fathomUrl,
        closingCallId: callId,
        aiInsights: [
          "Cliente creado automáticamente desde Closing.",
          payment.paymentType === "upfront"
            ? "Pago upfront — bajo riesgo de churn en Fase 0."
            : "Seguimiento de cuotas activado en el perfil del cliente.",
        ],
        linkedCalls: payment.fathomUrl
          ? [
              {
                id: `fc-${callId}`,
                title: `Llamada de cierre — ${payment.clientName}`,
                date: new Date().toISOString().slice(0, 10),
                duration: "—",
                url: payment.fathomUrl,
              },
            ]
          : [],
      };

      addClient(newClient);
      return newClient;
    },
    [addClient, closingCalls, updateClosingCall]
  );

  const markCallNotClosed = useCallback(
    (callId: string, reason: NoCloseReasonId, notes?: string) => {
      const call = closingCalls.find((c) => c.id === callId);
      updateClosingCall(callId, {
        status: "not_closed",
        outcome: { noCloseReason: reason, notes },
      });
      if (call) {
        setConversations((prev) =>
          prev.map((c) => {
            const match =
              c.id === call.conversationId ||
              c.leadName.toLowerCase() === call.leadName.toLowerCase();
            return match ? { ...c, tag: "no-closeado" as ConversationTagId } : c;
          })
        );
      }
    },
    [closingCalls, updateClosingCall]
  );

  const markCallNoShow = useCallback(
    (callId: string) => {
      const call = closingCalls.find((c) => c.id === callId);
      updateClosingCall(callId, { status: "no_show" });
      if (call) {
        setConversations((prev) =>
          prev.map((c) => {
            const match =
              c.id === call.conversationId ||
              c.leadName.toLowerCase() === call.leadName.toLowerCase();
            return match
              ? { ...c, tag: "muy-descalificado" as ConversationTagId }
              : c;
          })
        );
      }
    },
    [closingCalls, updateClosingCall]
  );

  const value = useMemo(
    () => ({
      conversations,
      setConversationTag,
      setConversationTagByLeadName,
      closingCalls,
      updateClosingCall,
      clients,
      addClient,
      updateClient,
      customRoles,
      addCustomRole,
      markCallClosed,
      markCallNotClosed,
      markCallNoShow,
    }),
    [
      conversations,
      setConversationTag,
      setConversationTagByLeadName,
      closingCalls,
      updateClosingCall,
      clients,
      addClient,
      updateClient,
      customRoles,
      addCustomRole,
      markCallClosed,
      markCallNotClosed,
      markCallNoShow,
    ]
  );

  return (
    <PlatformDataContext.Provider value={value}>
      {children}
    </PlatformDataContext.Provider>
  );
}

export function usePlatformData(): PlatformDataContextValue {
  const ctx = useContext(PlatformDataContext);
  if (!ctx) {
    throw new Error("usePlatformData debe usarse dentro de PlatformDataProvider");
  }
  return ctx;
}

export type { ClientStatus };

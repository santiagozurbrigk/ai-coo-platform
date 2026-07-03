"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  listClosingCallsAction,
  updateClosingCallAction,
} from "@/app/closing/actions";
import {
  getOrganizationIdAction,
  listConversationsAction,
  updateConversationTagAction,
} from "@/app/conversations/actions";
import {
  rowToConversation,
  type ConversationRow,
} from "@/lib/conversations/mapper";
import { createClient } from "@/lib/supabase/client";
import { getOnboardingStatusAction } from "@/app/onboarding/actions";
import {
  createClientAction,
  listClientsAction,
  updateClientAction,
} from "@/app/clients/actions";
import { recordClientPaymentAction } from "@/app/clients/payment-actions";
import {
  getPaidAmountFromClosePayload,
  getPaymentDateFromClosePayload,
  installmentNumberForClosePayload,
} from "@/lib/clients/payment-utils";
import { mockClosingCalls } from "@/mocks/closing";
import { mockClients } from "@/mocks/clients";
import { mockConversations } from "@/mocks/sales";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Client, ClientStatus } from "@/types/clients";
import type {
  ClosePaymentPayload,
  ClosingCall,
  NoCloseReasonId,
} from "@/types/closing";
import { deriveSalesMetrics } from "@/lib/metrics/derive-sales-metrics";
import { mockSalesMetrics } from "@/mocks/sales";
import type { Conversation, ConversationTagId, SalesMetricsData } from "@/types/sales";
import type { OnboardingData } from "@/types/onboarding";
import type { CustomRole } from "@/types/team";

type PlatformDataContextValue = {
  conversations: Conversation[];
  conversationsLoading: boolean;
  salesMetrics: SalesMetricsData;
  salesMetricsLoading: boolean;
  setConversationTag: (
    conversationId: string,
    tag: ConversationTagId | null
  ) => Promise<void>;
  setConversationTagByLeadName: (
    leadName: string,
    tag: ConversationTagId
  ) => Promise<void>;
  closingCalls: ClosingCall[];
  closingCallsLoading: boolean;
  updateClosingCall: (id: string, patch: Partial<ClosingCall>) => Promise<void>;
  clients: Client[];
  clientsLoading: boolean;
  addClient: (client: Omit<Client, "id"> | Client) => Promise<Client>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<void>;
  customRoles: CustomRole[];
  addCustomRole: (role: CustomRole) => void;
  markCallClosed: (callId: string, payment: ClosePaymentPayload) => Promise<Client>;
  markCallNotClosed: (
    callId: string,
    reason: NoCloseReasonId,
    notes?: string
  ) => Promise<void>;
  markCallNoShow: (callId: string) => Promise<void>;
  refreshClients: () => Promise<void>;
  refreshClosingCalls: () => Promise<void>;
  refreshConversations: () => Promise<void>;
  onboardingComplete: boolean | null;
  onboardingData: OnboardingData | null;
  refreshOnboarding: () => Promise<void>;
};

const PlatformDataContext = createContext<PlatformDataContextValue | null>(null);

const useSupabase = isSupabaseConfigured();

function findConversationByLead(
  conversations: Conversation[],
  leadName: string
): Conversation | undefined {
  return conversations.find(
    (c) => c.leadName.toLowerCase() === leadName.toLowerCase()
  );
}

function sortConversationsByRecency(list: Conversation[]): Conversation[] {
  return [...list].sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

function buildClientFromPayment(
  callId: string,
  payment: ClosePaymentPayload
): Omit<Client, "id"> {
  const revenue =
    payment.paymentType === "upfront"
      ? payment.totalAmount ?? 0
      : payment.paymentType === "installments"
        ? (payment.installmentAmount ?? 0) * (payment.installmentCount ?? 1)
        : (payment.upfrontAmount ?? 0) + (payment.feeAmount ?? 0);

  const installments =
    payment.paymentType === "installments" && payment.installmentCount
      ? Array.from({ length: payment.installmentCount }, (_, i) => {
          const paidAt =
            i === 0
              ? (payment.firstInstallmentDate ??
                new Date().toISOString().slice(0, 10))
              : undefined;
          return {
            id: `inst-${callId}-${i + 1}`,
            label: `Cuota ${i + 1}`,
            amount: payment.installmentAmount ?? 0,
            status: (i === 0 ? "paid" : "pending") as "paid" | "pending",
            paidAt,
            dueDate: i === 0 ? payment.firstInstallmentDate : undefined,
          };
        })
      : undefined;

  const contextInsights = [
    payment.offeredProduct
      ? `Producto ofrecido: ${payment.offeredProduct}`
      : null,
    payment.avatar ? `Avatar / ICP: ${payment.avatar}` : null,
    payment.mainPain ? `Dolor principal: ${payment.mainPain}` : null,
    payment.objections ? `Objeciones: ${payment.objections}` : null,
    payment.feedbackNotes ? `Feedback: ${payment.feedbackNotes}` : null,
  ].filter((line): line is string => Boolean(line));

  return {
    name: payment.clientName,
    joinDate: new Date().toISOString().slice(0, 10),
    paymentType: payment.paymentType,
    platform: "other",
    totalAmount: revenue,
    upfrontAmount: payment.upfrontAmount,
    feeAmount: payment.feeAmount,
    feeFrequency: payment.feeFrequency,
    status: "pending_onboarding",
    isSuccessCase: false,
    installments,
    salesFathomUrl: payment.fathomUrl,
    closingCallId: callId,
    offeredProduct: payment.offeredProduct,
    feedbackNotes: payment.feedbackNotes,
    avatar: payment.avatar,
    mainPain: payment.mainPain,
    objections: payment.objections,
    aiInsights: [
      "Cliente creado automáticamente desde Closing.",
      payment.paymentType === "upfront"
        ? "Pago upfront — seguimiento estándar de onboarding."
        : "Seguimiento de cuotas activado en el perfil del cliente.",
      ...contextInsights,
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
}

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    useSupabase ? [] : mockConversations.map((c) => ({ ...c }))
  );
  const [conversationsLoading, setConversationsLoading] = useState(useSupabase);
  const [closingCalls, setClosingCalls] = useState<ClosingCall[]>(() =>
    useSupabase ? [] : mockClosingCalls.map((c) => ({ ...c }))
  );
  const [closingCallsLoading, setClosingCallsLoading] = useState(useSupabase);

  const salesMetricsLoading =
    useSupabase && (conversationsLoading || closingCallsLoading);

  const salesMetrics = useMemo(() => {
    if (!useSupabase) return mockSalesMetrics;
    if (salesMetricsLoading) {
      return deriveSalesMetrics([], [], []);
    }
    return deriveSalesMetrics(conversations, closingCalls);
  }, [conversations, closingCalls, salesMetricsLoading]);
  const [clients, setClients] = useState<Client[]>(() =>
    useSupabase ? [] : mockClients.map((c) => ({ ...c }))
  );
  const [clientsLoading, setClientsLoading] = useState(useSupabase);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(
    useSupabase ? null : false
  );
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(
    null
  );

  const refreshClients = useCallback(async () => {
    if (!useSupabase) return;
    setClientsLoading(true);
    try {
      const list = await listClientsAction();
      setClients(list);
    } catch (e) {
      console.error("[PlatformDataProvider] listClients", e);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  const refreshClosingCalls = useCallback(async () => {
    if (!useSupabase) return;
    setClosingCallsLoading(true);
    try {
      const list = await listClosingCallsAction();
      setClosingCalls(list);
    } catch (e) {
      console.error("[PlatformDataProvider] listClosingCalls", e);
    } finally {
      setClosingCallsLoading(false);
    }
  }, []);

  const refreshConversations = useCallback(async () => {
    if (!useSupabase) return;
    setConversationsLoading(true);
    try {
      const list = await listConversationsAction();
      setConversations(list);
    } catch (e) {
      console.error("[PlatformDataProvider] listConversations", e);
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const refreshOnboarding = useCallback(async () => {
    if (!useSupabase) {
      setOnboardingComplete(false);
      setOnboardingData(null);
      return;
    }
    try {
      const status = await getOnboardingStatusAction();
      setOnboardingComplete(status.completed);
      setOnboardingData(status.data);
    } catch (e) {
      console.error("[PlatformDataProvider] onboarding", e);
    }
  }, []);

  useEffect(() => {
    if (!useSupabase) return;
    void (async () => {
      await refreshClients();
      await refreshClosingCalls();
      await refreshConversations();
      await refreshOnboarding();
    })();
  }, [
    refreshClients,
    refreshClosingCalls,
    refreshConversations,
    refreshOnboarding,
  ]);

  useEffect(() => {
    if (!useSupabase) return;

    let cancelled = false;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void (async () => {
      const organizationId = await getOrganizationIdAction();
      if (!organizationId || cancelled) return;

      const nextChannel = supabase
        .channel(`conversations:org:${organizationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "conversations",
            filter: `organization_id=eq.${organizationId}`,
          },
          (payload) => {
            const conversation = rowToConversation(payload.new as ConversationRow);
            setConversations((prev) => {
              if (prev.some((c) => c.id === conversation.id)) return prev;
              return sortConversationsByRecency([conversation, ...prev]);
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "conversations",
            filter: `organization_id=eq.${organizationId}`,
          },
          (payload) => {
            const conversation = rowToConversation(payload.new as ConversationRow);
            setConversations((prev) => {
              const idx = prev.findIndex((c) => c.id === conversation.id);
              if (idx === -1) return prev;
              const next = [...prev];
              next[idx] = conversation;
              return sortConversationsByRecency(next);
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
          console.error("[PlatformDataProvider] conversations realtime", status, err);
        }
      });
    })();

    return () => {
      cancelled = true;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  const persistConversationTag = useCallback(
    async (conversationId: string, tag: ConversationTagId | null) => {
      if (useSupabase) {
        const saved = await updateConversationTagAction(conversationId, tag);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? saved : c))
        );
        return;
      }
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, tag } : c))
      );
    },
    []
  );

  const setConversationTag = useCallback(
    (conversationId: string, tag: ConversationTagId | null) =>
      persistConversationTag(conversationId, tag),
    [persistConversationTag]
  );

  const setConversationTagByLeadName = useCallback(
    async (leadName: string, tag: ConversationTagId) => {
      const conv = findConversationByLead(conversations, leadName);
      if (conv) {
        await persistConversationTag(conv.id, tag);
        return;
      }
      setConversations((prev) => {
        const match = findConversationByLead(prev, leadName);
        if (!match) return prev;
        void persistConversationTag(match.id, tag);
        return prev.map((c) =>
          c.leadName.toLowerCase() === leadName.toLowerCase()
            ? { ...c, tag }
            : c
        );
      });
    },
    [conversations, persistConversationTag]
  );

  const syncConversationTagForCall = useCallback(
    async (call: ClosingCall | undefined, tag: ConversationTagId) => {
      if (!call) return;
      const conv =
        conversations.find((c) => c.id === call.conversationId) ??
        findConversationByLead(conversations, call.leadName);
      if (conv) await persistConversationTag(conv.id, tag);
    },
    [conversations, persistConversationTag]
  );

  const updateClosingCall = useCallback(
    async (id: string, patch: Partial<ClosingCall>) => {
      if (useSupabase) {
        const saved = await updateClosingCallAction(id, patch);
        setClosingCalls((prev) =>
          prev.map((c) => (c.id === id ? saved : c))
        );
        return;
      }

      setClosingCalls((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
      );
    },
    []
  );

  const addClient = useCallback(
    async (client: Omit<Client, "id"> | Client): Promise<Client> => {
      const payload =
        "id" in client
          ? (() => {
              const { id: _id, ...rest } = client;
              void _id;
              return rest;
            })()
          : client;

      if (useSupabase) {
        const saved = await createClientAction(payload);
        setClients((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
        return saved;
      }

      const local: Client = {
        ...payload,
        id: `client-${Date.now()}`,
      };
      setClients((prev) => [local, ...prev]);
      return local;
    },
    []
  );

  const updateClient = useCallback(async (id: string, patch: Partial<Client>) => {
    if (useSupabase) {
      const saved = await updateClientAction(id, patch);
      setClients((prev) => prev.map((c) => (c.id === id ? saved : c)));
      return;
    }

    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c))
    );
  }, []);

  const addCustomRole = useCallback((role: CustomRole) => {
    setCustomRoles((prev) => [...prev, role]);
  }, []);

  const markCallClosed = useCallback(
    async (callId: string, payment: ClosePaymentPayload): Promise<Client> => {
      const call = closingCalls.find((c) => c.id === callId);
      const revenue =
        payment.paymentType === "upfront"
          ? payment.totalAmount ?? 0
          : payment.paymentType === "installments"
            ? (payment.installmentAmount ?? 0) *
              (payment.installmentCount ?? 1)
            : (payment.upfrontAmount ?? 0) + (payment.feeAmount ?? 0);

      await updateClosingCall(callId, {
        status: "closed",
        outcome: {
          paymentType: payment.paymentType,
          revenue,
        },
        fathomUrl: payment.fathomUrl ?? call?.fathomUrl,
        closedByName: payment.closedByName ?? "Martín López",
        paymentReceivedFrom: payment.paymentReceivedFrom,
        paymentDestinationPlatformId: payment.paymentDestinationPlatformId,
      });

      await syncConversationTagForCall(call, "closeado");

      const draft = buildClientFromPayment(callId, payment);
      const client = await addClient(draft);

      if (useSupabase && payment.proof) {
        const recordResult = await recordClientPaymentAction({
          clientId: client.id,
          amount: getPaidAmountFromClosePayload(payment),
          paymentDate: getPaymentDateFromClosePayload(payment),
          storagePath: payment.proof.storagePath,
          mimeType: payment.proof.mimeType,
          installmentNumber: installmentNumberForClosePayload(payment),
          paymentReceivedFrom: payment.paymentReceivedFrom,
          paymentDestinationPlatformId: payment.paymentDestinationPlatformId,
        });
        if (!recordResult.success) {
          throw new Error(recordResult.error);
        }
        const { data: refreshed } = await listClientsAction().then((list) => ({
          data: list.find((c) => c.id === client.id) ?? client,
        }));
        setClients((prev) =>
          prev.map((c) => (c.id === client.id ? refreshed : c))
        );
        return refreshed;
      }

      return client;
    },
    [addClient, closingCalls, syncConversationTagForCall, updateClosingCall]
  );

  const markCallNotClosed = useCallback(
    async (callId: string, reason: NoCloseReasonId, notes?: string) => {
      const call = closingCalls.find((c) => c.id === callId);
      await updateClosingCall(callId, {
        status: "not_closed",
        outcome: { noCloseReason: reason, notes },
      });
      await syncConversationTagForCall(call, "no-closeado");
    },
    [closingCalls, syncConversationTagForCall, updateClosingCall]
  );

  const markCallNoShow = useCallback(
    async (callId: string) => {
      const call = closingCalls.find((c) => c.id === callId);
      await updateClosingCall(callId, { status: "no_show" });
      await syncConversationTagForCall(call, "muy-descalificado");
    },
    [closingCalls, syncConversationTagForCall, updateClosingCall]
  );

  const value = useMemo(
    () => ({
      conversations,
      conversationsLoading,
      salesMetrics,
      salesMetricsLoading,
      setConversationTag,
      setConversationTagByLeadName,
      closingCalls,
      closingCallsLoading,
      updateClosingCall,
      clients,
      clientsLoading,
      addClient,
      updateClient,
      customRoles,
      addCustomRole,
      markCallClosed,
      markCallNotClosed,
      markCallNoShow,
      refreshClients,
      refreshClosingCalls,
      refreshConversations,
      onboardingComplete,
      onboardingData,
      refreshOnboarding,
    }),
    [
      conversations,
      conversationsLoading,
      salesMetrics,
      salesMetricsLoading,
      setConversationTag,
      setConversationTagByLeadName,
      closingCalls,
      closingCallsLoading,
      updateClosingCall,
      clients,
      clientsLoading,
      addClient,
      updateClient,
      customRoles,
      addCustomRole,
      markCallClosed,
      markCallNotClosed,
      markCallNoShow,
      refreshClients,
      refreshClosingCalls,
      refreshConversations,
      onboardingComplete,
      onboardingData,
      refreshOnboarding,
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

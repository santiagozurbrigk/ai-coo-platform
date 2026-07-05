"use client";

import { useState, useTransition } from "react";
import { User, Package, ArrowUpRight, FileText, Lightbulb, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@ai-coo/ui";
import { applyProposalAction, rejectProposalAction } from "@/app/agent/graph-proposal-actions";
import type { GraphProposal, GraphProposalEntityType } from "@/types/agent";
import { useToast } from "@/providers/toast-provider";

const ENTITY_META: Record<
  GraphProposalEntityType,
  { label: string; icon: React.ReactNode; colorClass: string }
> = {
  customer_avatar: {
    label: "Avatar de cliente",
    icon: <User className="h-4 w-4" />,
    colorClass: "border-blue-200 bg-blue-50/80 dark:border-blue-500/30 dark:bg-blue-950/40",
  },
  product: {
    label: "Producto / Oferta",
    icon: <Package className="h-4 w-4" />,
    colorClass: "border-violet-200 bg-violet-50/80 dark:border-violet-500/30 dark:bg-violet-950/40",
  },
  value_ladder_step: {
    label: "Escalón de valor",
    icon: <ArrowUpRight className="h-4 w-4" />,
    colorClass: "border-emerald-200 bg-emerald-50/80 dark:border-emerald-500/30 dark:bg-emerald-950/40",
  },
  sales_framework: {
    label: "Framework de ventas",
    icon: <FileText className="h-4 w-4" />,
    colorClass: "border-orange-200 bg-orange-50/80 dark:border-orange-500/30 dark:bg-orange-950/40",
  },
  value_proposition: {
    label: "Propuesta de valor",
    icon: <Lightbulb className="h-4 w-4" />,
    colorClass: "border-amber-200 bg-amber-50/80 dark:border-amber-500/30 dark:bg-amber-950/40",
  },
};

const PAYLOAD_LABELS: Record<string, string> = {
  name: "Nombre",
  mainPain: "Dolor principal",
  occupation: "Ocupación",
  location: "Ubicación",
  ageRange: "Rango etario",
  isPrimary: "Avatar principal",
  desires: "Deseos",
  objections: "Objeciones",
  whereTheyHang: "Dónde está",
  description: "Descripción",
  type: "Tipo",
  price: "Precio",
  currency: "Moneda",
  billingType: "Facturación",
  isCoreOffer: "Core offer",
  valueLadderPosition: "Posición en escalera",
  content: "Contenido",
  avatar: "Avatar",
  result: "Resultado",
  painRemoved: "Dolor eliminado",
  timeframe: "Tiempo",
};

function renderPayloadValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (Array.isArray(value)) return (value as string[]).join(", ") || "—";
  if (key === "content" && typeof value === "string") {
    return value.length > 120 ? value.slice(0, 120) + "…" : value;
  }
  return String(value);
}

interface ProposalCardProps {
  proposal: GraphProposal;
  onSettled?: (id: string, newStatus: "approved" | "rejected") => void;
}

export function ProposalCard({ proposal, onSettled }: ProposalCardProps) {
  const [isPending, startTransition] = useTransition();
  // Local display status so the card flips immediately without a page refresh
  const [localStatus, setLocalStatus] = useState<GraphProposal["status"]>(
    proposal.status
  );
  const { push } = useToast();
  const meta = ENTITY_META[proposal.entityType];

  if (localStatus !== "pending") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        {localStatus === "approved" ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Cambio aplicado</span>
          </>
        ) : (
          <>
            <XCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
            <span>Descartado</span>
          </>
        )}
      </div>
    );
  }

  const payloadEntries = Object.entries(proposal.payload).filter(
    ([k]) => k !== "id" && PAYLOAD_LABELS[k] !== undefined
  );

  const actionLabel = proposal.action === "create" ? "Crear" : "Editar";

  const handleApply = () => {
    setLocalStatus("approved"); // optimistic flip
    startTransition(async () => {
      const result = await applyProposalAction(proposal.id);
      if (result.success) {
        push({ title: "Cambio aplicado al modelo de negocio", variant: "default" });
        onSettled?.(proposal.id, "approved");
      } else {
        setLocalStatus("pending"); // rollback on error
        push({
          title: "No se pudo aplicar el cambio",
          description: result.error,
          variant: "default",
        });
      }
    });
  };

  const handleReject = () => {
    setLocalStatus("rejected"); // optimistic flip
    startTransition(async () => {
      await rejectProposalAction(proposal.id);
      onSettled?.(proposal.id, "rejected");
    });
  };

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        meta?.colorClass ??
          "border-border bg-muted/40"
      )}
    >
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <span className="text-muted-foreground">{meta?.icon}</span>
        <span className="font-medium text-foreground">
          {actionLabel} {meta?.label ?? proposal.entityType}
        </span>
      </div>

      {/* Payload summary */}
      {payloadEntries.length > 0 && (
        <dl className="mb-3 space-y-1">
          {payloadEntries.slice(0, 6).map(([key, value]) => (
            <div key={key} className="flex gap-1.5 text-xs">
              <dt className="shrink-0 text-muted-foreground">
                {PAYLOAD_LABELS[key] ?? key}:
              </dt>
              <dd className="text-foreground/90">
                {renderPayloadValue(key, value)}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleApply}
          className="flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          Aplicar
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={handleReject}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <XCircle className="h-3 w-3" />
          Descartar
        </button>
      </div>
    </div>
  );
}

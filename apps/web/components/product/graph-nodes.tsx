"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CSSProperties } from "react";
import {
  Building2,
  User,
  Package,
  ArrowUpRight,
  FileText,
  Lightbulb,
} from "lucide-react";
import { cn } from "@ai-coo/ui";
import { categoryInk, categorySurface } from "@/lib/ui/category-badge";
import type { GraphNodeData } from "@/types/product";

/**
 * Slot de la paleta categórica por tipo de nodo.
 *
 * El nodo raíz no entra: no es un tipo de entidad más sino el centro del grafo,
 * así que va en neutro y no gasta un color de categoría.
 *
 * El orden conserva el color que ya tenía cada tipo donde se podía (avatar
 * azul, escalón verde, framework naranja). `product` era violeta de la marca
 * anterior y pasa a índigo; `proposition` era ámbar, que contra el naranja del
 * framework eran prácticamente el mismo color, y pasa a rosa.
 */
const NODE_SLOT = {
  framework: 0,
  avatar: 1,
  ladderStep: 2,
  product: 3,
  proposition: 4,
} as const;

/**
 * Énfasis dentro de un mismo tipo (avatar principal, core offer): mismo tono,
 * más intensidad. Antes eran dos hues distintos —violeta vs púrpura, azul vs
 * celeste— y se leían como dos categorías en vez de como una destacada.
 */
function nodeSurface(slot: number, strong = false): CSSProperties {
  return categorySurface(slot, {
    fill: strong ? 13 : 7,
    border: strong ? 45 : 25,
    ink: false,
  });
}

function chipSurface(slot: number, strong = false): CSSProperties {
  return categorySurface(slot, {
    fill: strong ? 22 : 14,
    border: strong ? 50 : 30,
    ink: false,
  });
}

function badgeSurface(slot: number): CSSProperties {
  return categorySurface(slot, { fill: 16, border: 32 });
}

// ---------- shared shell ----------

function NodeShell({
  children,
  className,
  style,
  hasTarget = true,
  hasSource = true,
  pending = false,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  hasTarget?: boolean;
  hasSource?: boolean;
  pending?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border shadow-sm",
        className,
        // `pending` es un estado, no una categoría: lo propuso el agente y
        // todavía no se aplicó. Va al color de IA (el de marca), no a un slot.
        pending && "opacity-80 ring-2 ring-dashed ring-primary"
      )}
      style={style}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-2 !w-2 !border-2 !bg-background"
        />
      )}
      {pending && (
        <span className="absolute -right-2 -top-2 z-10 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold text-primary-foreground shadow-sm">
          Pendiente
        </span>
      )}
      {children}
      {hasSource && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!h-2 !w-2 !border-2 !bg-background"
        />
      )}
    </div>
  );
}

/** Título + subtítulo, idénticos en todos los nodos. */
function NodeText({
  label,
  sublabel,
  align = "start",
  clamp = false,
  capitalizeSublabel = false,
  children,
}: {
  label: string;
  sublabel?: string;
  align?: "start" | "center";
  clamp?: boolean;
  capitalizeSublabel?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", align === "center" && "text-center")}>
      <p className="truncate text-xs font-semibold text-foreground">{label}</p>
      {sublabel && (
        <p
          className={cn(
            "mt-0.5 text-[10px] text-muted-foreground",
            clamp ? "line-clamp-2 leading-tight" : "truncate",
            capitalizeSublabel && "capitalize"
          )}
        >
          {sublabel}
        </p>
      )}
      {children}
    </div>
  );
}

// ---------- Root ----------

export function RootGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  return (
    <NodeShell
      hasTarget={false}
      pending={d.pending}
      className="w-48 border-border bg-muted/60"
    >
      <div className="flex flex-col items-center gap-2 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <NodeText
          align="center"
          label={d.orgName ?? d.label}
          sublabel={d.sublabel ?? "Centro del negocio"}
        />
      </div>
    </NodeShell>
  );
}

// ---------- Avatar ----------

export function AvatarGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  const slot = NODE_SLOT.avatar;
  return (
    <NodeShell
      pending={d.pending}
      className="w-52"
      style={nodeSurface(slot, d.isPrimary)}
    >
      <div className="flex items-start gap-3 p-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
          style={chipSurface(slot, d.isPrimary)}
        >
          <User className="h-4 w-4" style={{ color: categoryInk(slot) }} />
        </div>
        <NodeText clamp label={d.label} sublabel={d.sublabel}>
          {d.isPrimary && (
            <span
              className="mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-medium"
              style={badgeSurface(slot)}
            >
              Primario
            </span>
          )}
        </NodeText>
      </div>
    </NodeShell>
  );
}

// ---------- Product ----------

export function ProductGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  const isCore = d.badge === "Core offer";
  const slot = NODE_SLOT.product;
  return (
    <NodeShell
      pending={d.pending}
      className="w-48"
      style={nodeSurface(slot, isCore)}
    >
      <div className="flex items-start gap-3 p-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
          style={chipSurface(slot, isCore)}
        >
          <Package className="h-4 w-4" style={{ color: categoryInk(slot) }} />
        </div>
        <NodeText label={d.label} sublabel={d.sublabel}>
          {isCore && (
            <span
              className="mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[9px] font-medium"
              style={badgeSurface(slot)}
            >
              Core offer
            </span>
          )}
        </NodeText>
      </div>
    </NodeShell>
  );
}

// ---------- Ladder Step ----------

export function LadderStepGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  const slot = NODE_SLOT.ladderStep;
  return (
    <NodeShell pending={d.pending} className="w-44" style={nodeSurface(slot)}>
      <div className="flex items-start gap-2.5 p-3">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
          style={chipSurface(slot)}
        >
          <ArrowUpRight
            className="h-3.5 w-3.5"
            style={{ color: categoryInk(slot) }}
          />
        </div>
        <NodeText label={d.label} sublabel={d.sublabel} />
      </div>
    </NodeShell>
  );
}

// ---------- Framework ----------

export function FrameworkGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  const slot = NODE_SLOT.framework;
  return (
    <NodeShell pending={d.pending} className="w-44" style={nodeSurface(slot)}>
      <div className="flex items-start gap-2.5 p-3">
        <div
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
          style={chipSurface(slot)}
        >
          <FileText
            className="h-3.5 w-3.5"
            style={{ color: categoryInk(slot) }}
          />
        </div>
        <NodeText capitalizeSublabel label={d.label} sublabel={d.sublabel} />
      </div>
    </NodeShell>
  );
}

// ---------- Proposition ----------

export function PropositionGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  const slot = NODE_SLOT.proposition;
  return (
    <NodeShell pending={d.pending} className="w-52" style={nodeSurface(slot)}>
      <div className="flex items-start gap-3 p-3">
        <div
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
          style={chipSurface(slot)}
        >
          <Lightbulb className="h-4 w-4" style={{ color: categoryInk(slot) }} />
        </div>
        <NodeText clamp label={d.label} sublabel={d.sublabel} />
      </div>
    </NodeShell>
  );
}

// ---------- nodeTypes registry (must be stable / outside component) ----------

export const GRAPH_NODE_TYPES = {
  root: RootGraphNode,
  avatar: AvatarGraphNode,
  product: ProductGraphNode,
  "ladder-step": LadderStepGraphNode,
  framework: FrameworkGraphNode,
  proposition: PropositionGraphNode,
} as const;

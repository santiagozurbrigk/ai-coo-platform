"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Building2,
  User,
  Package,
  ArrowUpRight,
  FileText,
  Lightbulb,
} from "lucide-react";
import { cn } from "@ai-coo/ui";
import type { GraphNodeData } from "@/types/product";

// ---------- shared shell ----------

function NodeShell({
  children,
  className,
  hasTarget = true,
  hasSource = true,
  pending = false,
}: {
  children: React.ReactNode;
  className: string;
  hasTarget?: boolean;
  hasSource?: boolean;
  pending?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl border shadow-sm",
        className,
        pending && "ring-2 ring-dashed ring-violet-400 dark:ring-violet-400 opacity-80"
      )}
    >
      {hasTarget && (
        <Handle
          type="target"
          position={Position.Top}
          className="!h-2 !w-2 !border-2 !bg-background"
        />
      )}
      {pending && (
        <span className="absolute -right-2 -top-2 z-10 rounded-full bg-violet-500 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm">
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

// ---------- Root ----------

export function RootGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  return (
    <NodeShell
      hasTarget={false}
      pending={d.pending}
      className="w-48 border-violet-200 bg-violet-50/95 dark:border-violet-500/40 dark:bg-violet-950/50"
    >
      <div className="flex flex-col items-center gap-2 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-300 bg-violet-100 dark:border-violet-500/50 dark:bg-violet-600/30">
          <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-300" />
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-900 dark:text-white/90">
            {d.orgName ?? d.label}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 dark:text-white/40">
            {d.sublabel ?? "Centro del negocio"}
          </p>
        </div>
      </div>
    </NodeShell>
  );
}

// ---------- Avatar ----------

export function AvatarGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  return (
    <NodeShell
      pending={d.pending}
      className={cn(
        "w-52",
        d.isPrimary
          ? "border-blue-300 bg-blue-50/95 dark:border-blue-500/50 dark:bg-blue-950/50"
          : "border-sky-200 bg-sky-50/95 dark:border-sky-500/30 dark:bg-sky-950/40"
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            d.isPrimary
              ? "border-blue-300 bg-blue-100 dark:border-blue-500/50 dark:bg-blue-600/30"
              : "border-sky-200 bg-sky-100 dark:border-sky-500/30 dark:bg-sky-600/20"
          )}
        >
          <User
            className={cn(
              "h-4 w-4",
              d.isPrimary
                ? "text-blue-600 dark:text-blue-300"
                : "text-sky-500 dark:text-sky-300"
            )}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white/90">
            {d.label}
          </p>
          {d.sublabel && (
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-slate-500 dark:text-white/40">
              {d.sublabel}
            </p>
          )}
          {d.isPrimary && (
            <span className="mt-1 inline-block rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-medium text-blue-700 dark:text-blue-300">
              Primario
            </span>
          )}
        </div>
      </div>
    </NodeShell>
  );
}

// ---------- Product ----------

export function ProductGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  const isCore = d.badge === "Core offer";
  return (
    <NodeShell
      pending={d.pending}
      className={cn(
        "w-48",
        isCore
          ? "border-violet-300 bg-violet-50/95 dark:border-violet-500/50 dark:bg-violet-950/50"
          : "border-purple-200 bg-purple-50/95 dark:border-purple-500/30 dark:bg-purple-950/40"
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <div
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
            isCore
              ? "border-violet-300 bg-violet-100 dark:border-violet-500/50 dark:bg-violet-600/30"
              : "border-purple-200 bg-purple-100 dark:border-purple-500/30 dark:bg-purple-600/20"
          )}
        >
          <Package
            className={cn(
              "h-4 w-4",
              isCore
                ? "text-violet-600 dark:text-violet-300"
                : "text-purple-500 dark:text-purple-300"
            )}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white/90">
            {d.label}
          </p>
          {d.sublabel && (
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-white/40">
              {d.sublabel}
            </p>
          )}
          {isCore && (
            <span className="mt-1 inline-block rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[9px] font-medium text-violet-700 dark:text-violet-300">
              Core offer
            </span>
          )}
        </div>
      </div>
    </NodeShell>
  );
}

// ---------- Ladder Step ----------

export function LadderStepGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  return (
    <NodeShell pending={d.pending} className="w-44 border-emerald-200 bg-emerald-50/95 dark:border-emerald-500/30 dark:bg-emerald-950/40">
      <div className="flex items-start gap-2.5 p-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-600/20">
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-300" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white/90">
            {d.label}
          </p>
          {d.sublabel && (
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-white/40">
              {d.sublabel}
            </p>
          )}
        </div>
      </div>
    </NodeShell>
  );
}

// ---------- Framework ----------

export function FrameworkGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  return (
    <NodeShell pending={d.pending} className="w-44 border-orange-200 bg-orange-50/95 dark:border-orange-500/30 dark:bg-orange-950/40">
      <div className="flex items-start gap-2.5 p-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-orange-200 bg-orange-100 dark:border-orange-500/30 dark:bg-orange-600/20">
          <FileText className="h-3.5 w-3.5 text-orange-600 dark:text-orange-300" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white/90">
            {d.label}
          </p>
          {d.sublabel && (
            <p className="mt-0.5 truncate text-[10px] capitalize text-slate-500 dark:text-white/40">
              {d.sublabel}
            </p>
          )}
        </div>
      </div>
    </NodeShell>
  );
}

// ---------- Proposition ----------

export function PropositionGraphNode({ data }: NodeProps) {
  const d = data as GraphNodeData;
  return (
    <NodeShell pending={d.pending} className="w-52 border-amber-200 bg-amber-50/95 dark:border-amber-500/30 dark:bg-amber-950/40">
      <div className="flex items-start gap-3 p-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-amber-100 dark:border-amber-500/30 dark:bg-amber-600/20">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-300" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-900 dark:text-white/90">
            {d.label}
          </p>
          {d.sublabel && (
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-slate-500 dark:text-white/40">
              {d.sublabel}
            </p>
          )}
        </div>
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

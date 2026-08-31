"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { Badge } from "@ai-coo/ui";
import { getAreaClasses, getAreaStyle } from "@/lib/workboard/styles";
import { CONVERSATION_TAG_CONFIG } from "@/constants/conversation-tags";
import { ConversationTagBadge } from "@/components/sales/conversation-tag-badge";
import { categorySurface, CATEGORY_SLOTS } from "@/lib/ui/category-badge";
import {
  AvatarGraphNode,
  FrameworkGraphNode,
  LadderStepGraphNode,
  ProductGraphNode,
  PropositionGraphNode,
  RootGraphNode,
} from "@/components/product/graph-nodes";
import type { NodeProps } from "@xyflow/react";
import type { GraphNodeData } from "@/types/product";
import type { TaskArea } from "@/types/workboard";
import type { ConversationTagId } from "@/types/sales";

const AREAS: TaskArea[] = ["operaciones", "ventas", "finanzas", "marketing", "clientes", "general"];
const TAGS = Object.keys(CONVERSATION_TAG_CONFIG) as ConversationTagId[];

/** Los nodos sólo leen `data`; el resto de `NodeProps` lo pone React Flow. */
const np = (data: Omit<GraphNodeData, "href">, id: string) =>
  ({ data: { ...data, href: "#" }, id, type: "preview" }) as unknown as NodeProps;

export function CategoryPreview() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Paleta categórica en UI</h1>
        <p className="max-w-2xl text-caption text-muted-foreground">
          Los mismos seis slots validados que usan los gráficos, aplicados a
          badges, etiquetas y nodos. Sirve para verificar contraste y separación
          entre categorías en los dos temas.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Slots</h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: CATEGORY_SLOTS }, (_, i) => (
            <span key={i} className="rounded-full border px-3 py-1 text-xs font-medium" style={categorySurface(i)}>
              slot {i + 1}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Áreas de workboard</h2>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <Badge key={a} variant="outline" className={getAreaClasses(a)} style={getAreaStyle(a)}>
              {a}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Etiquetas de conversación</h2>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => <ConversationTagBadge key={t} tag={t} />)}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Nodos del grafo de producto</h2>
        <ReactFlowProvider>
          <div className="flex flex-wrap items-start gap-4">
            <RootGraphNode {...np({ label: "Mi negocio", orgName: "Limitless" }, "root")} />
            <AvatarGraphNode {...np({ label: "Founder saturado", sublabel: "No delega", isPrimary: true }, "a1")} />
            <AvatarGraphNode {...np({ label: "Coach inicial", sublabel: "Sin sistema" }, "a2")} />
            <ProductGraphNode {...np({ label: "Mentoría 1:1", sublabel: "USD 3.000", badge: "Core offer" }, "p1")} />
            <ProductGraphNode {...np({ label: "Curso grabado", sublabel: "USD 297" }, "p2")} />
            <LadderStepGraphNode {...np({ label: "Lead magnet", sublabel: "Gratis" }, "l1")} />
            <FrameworkGraphNode {...np({ label: "Script de cierre", sublabel: "ventas" }, "f1")} />
            <PropositionGraphNode {...np({ label: "Propuesta", sublabel: "Sistema operativo con IA para infoproductos" }, "v1")} />
            <ProductGraphNode {...np({ label: "Nuevo upsell", sublabel: "propuesto por IA", pending: true }, "p3")} />
          </div>
        </ReactFlowProvider>
      </section>
    </div>
  );
}

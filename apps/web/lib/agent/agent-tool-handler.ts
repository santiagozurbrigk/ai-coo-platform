import type { SupabaseClient } from "@supabase/supabase-js";
import {
  generateDocument,
  type DocumentContent,
} from "@/lib/agent/document-generator";
import { storeAgentDocument } from "@/lib/agent/document-storage";
import { documentContentToMarkdown } from "@/lib/agent/document-to-markdown";
import {
  PROPOSAL_TOOL_NAMES,
} from "@/lib/agent/graph-proposal-tools";
import { rowToProposal, type GraphProposalRow } from "@/lib/agent/mapper";
import type { GraphProposal } from "@/types/agent";

type WorkboardTaskUpdates = {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "review" | "done";
  area?: "marketing" | "ventas" | "operaciones" | "finanzas" | "clientes" | "general";
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
  assignee_name?: string | null;
  tags?: string[];
};

export type AgentToolHandlerState = {
  canvasFromDocument: string | null;
  createdProposals: GraphProposal[];
  generatedDocuments: Array<{
    filename: string;
    signedUrl: string;
    mimeType: string;
    sizeBytes: number;
  }>;
};

export type AgentToolHandlerContext = {
  organizationId: string;
  conversationId: string;
  supabase: SupabaseClient;
  state: AgentToolHandlerState;
};

export function createAgentToolHandler(ctx: AgentToolHandlerContext) {
  return async (
    name: string,
    toolInput: Record<string, unknown>
  ): Promise<string> => {
    const { organizationId, conversationId, supabase, state } = ctx;

    if (name === "generate_document") {
      const fmt = toolInput.format as "docx" | "xlsx" | "pdf" | "csv";
      const baseFilename = String(toolInput.filename ?? "documento");
      const rawContent =
        (toolInput.content as Record<string, unknown> | null | undefined) ?? {};

      let docContent: DocumentContent;
      if (fmt === "xlsx") {
        docContent = {
          kind: "sheet",
          sheets: [
            {
              name: "Datos",
              table: {
                headers: (rawContent.headers as string[]) ?? [],
                rows: (rawContent.rows as string[][]) ?? [],
              },
            },
          ],
        };
      } else if (fmt === "csv") {
        docContent = {
          kind: "csv",
          table: {
            headers: (rawContent.headers as string[]) ?? [],
            rows: (rawContent.rows as string[][]) ?? [],
          },
        };
      } else {
        docContent = {
          kind: fmt === "pdf" ? "pdf" : "doc",
          paragraphs:
            Array.isArray(rawContent.paragraphs) &&
            rawContent.paragraphs.length > 0
              ? (
                  rawContent.paragraphs as { text: string; style?: string }[]
                ).map((p) => ({
                  text: p?.text ?? "",
                  style: p?.style as
                    | "heading1"
                    | "heading2"
                    | "heading3"
                    | "body"
                    | "bullet"
                    | undefined,
                }))
              : [{ text: "Documento sin contenido." }],
        };
      }

      const generated = await generateDocument(fmt, docContent);
      const filename = `${baseFilename}.${generated.extension}`;
      const stored = await storeAgentDocument(organizationId, filename, generated);

      const markdown = documentContentToMarkdown(docContent);
      if (markdown.trim()) {
        state.canvasFromDocument = `# ${baseFilename}\n\n${markdown}`;
      }

      state.generatedDocuments.push({
        filename: stored.filename,
        signedUrl: stored.signedUrl,
        mimeType: stored.mimeType,
        sizeBytes: stored.sizeBytes,
      });

      return JSON.stringify({
        success: true,
        filename: stored.filename,
        message:
          "Documento disponible en el panel Canvas. No incluyas links ni URLs de descarga en tu respuesta.",
      });
    }

    if (name === "create_workboard_tasks") {
      const { createWorkboardTasksAction } = await import("@/app/agent/actions");
      const tasks = Array.isArray(toolInput.tasks) ? toolInput.tasks : [];
      const result = await createWorkboardTasksAction({ tasks });
      return result.ok
        ? `✅ ${result.created} tarea(s) creadas en el Tablero de Trabajo.`
        : `Error al crear tareas: ${result.error}`;
    }

    if (name === "search_workboard_tasks") {
      const { searchWorkboardTasksAction } = await import("@/app/agent/actions");
      const result = await searchWorkboardTasksAction({
        query: String(toolInput.query ?? ""),
        status: toolInput.status as
          | "todo"
          | "in_progress"
          | "review"
          | "done"
          | undefined,
      });
      return result.ok
        ? JSON.stringify(result.tasks)
        : `Error buscando tareas: ${result.error}`;
    }

    if (name === "update_workboard_task") {
      const { updateWorkboardTaskAction } = await import("@/app/agent/actions");
      const result = await updateWorkboardTaskAction({
        task_id: String(toolInput.task_id ?? ""),
        updates: (toolInput.updates ?? {}) as WorkboardTaskUpdates,
      });
      return result.ok
        ? "✅ Tarea actualizada correctamente."
        : `Error al actualizar tarea: ${result.error}`;
    }

    if (name === "analyze_content_piece") {
      const contentPieceId = String(toolInput.content_piece_id ?? "");
      try {
        const { analyzeContentPieceAction } = await import(
          "@/app/marketing/content/actions"
        );
        const analysis = await analyzeContentPieceAction(contentPieceId);
        return JSON.stringify({
          success: true,
          analysis: {
            formato: analysis.formato.name,
            dolor: analysis.dolor.name,
            angulo: analysis.angulo.name,
            why_it_worked: analysis.why_it_worked,
          },
          message: `Análisis completado. Formato: "${analysis.formato.name}" · Dolor: "${analysis.dolor.name}" · Ángulo: "${analysis.angulo.name}"`,
        });
      } catch (err) {
        return JSON.stringify({
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }

    if (name === "create_content_variants") {
      const sourceContentId = String(toolInput.source_content_id ?? "");
      const count = Math.min(Math.max(Number(toolInput.count ?? 1), 1), 5);
      const instructions =
        typeof toolInput.instructions === "string"
          ? toolInput.instructions
          : undefined;

      try {
        const { createContentVariantsAction } = await import(
          "@/app/marketing/content/actions"
        );
        const variantIds = await createContentVariantsAction({
          sourceContentId,
          count,
          instructions,
        });

        return JSON.stringify({
          success: true,
          variant_ids: variantIds,
          count: variantIds.length,
          message: `Se crearon ${variantIds.length} variante(s). Podés verlas en el módulo Contenido.`,
        });
      } catch (err) {
        return JSON.stringify({
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }

    if (name === "get_top_performing_content") {
      const metric = String(toolInput.metric ?? "engagement_total");
      const limit = Math.min(Math.max(Number(toolInput.limit ?? 10), 1), 50);
      const typeFilter = String(toolInput.type_filter ?? "all");

      try {
        const { getTopPerformingContentAction } = await import(
          "@/app/marketing/content/actions"
        );
        const results = await getTopPerformingContentAction({
          metric,
          limit,
          typeFilter,
        });

        return JSON.stringify({
          success: true,
          results,
          count: results.length,
        });
      } catch (err) {
        return JSON.stringify({
          success: false,
          error: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    }

    if (
      PROPOSAL_TOOL_NAMES.has(
        name as Parameters<typeof PROPOSAL_TOOL_NAMES["has"]>[0]
      )
    ) {
      const entityTypeMap: Record<string, GraphProposal["entityType"]> = {
        propose_customer_avatar: "customer_avatar",
        propose_product: "product",
        propose_value_ladder_step: "value_ladder_step",
        propose_sales_framework: "sales_framework",
        propose_value_proposition: "value_proposition",
      };
      const entityType = entityTypeMap[name];
      if (!entityType) return JSON.stringify({ error: "Unknown proposal tool" });

      const entityId = typeof toolInput.id === "string" ? toolInput.id : null;
      const action: "create" | "update" = entityId ? "update" : "create";
      const payload = { ...toolInput };
      delete (payload as Record<string, unknown>).id;

      try {
        const { data: proposalRow, error: insertErr } = await supabase
          .from("agent_graph_proposals")
          .insert({
            organization_id: organizationId,
            conversation_id: conversationId,
            message_id: null,
            entity_type: entityType,
            action,
            entity_id: entityId ?? null,
            payload,
            status: "pending",
          })
          .select("*")
          .single();

        if (insertErr || !proposalRow) {
          return JSON.stringify({
            error: insertErr?.message ?? "Failed to save proposal",
          });
        }

        const proposal = rowToProposal(proposalRow as GraphProposalRow);
        state.createdProposals.push(proposal);

        return JSON.stringify({
          success: true,
          proposalId: proposal.id,
          message: `Propuesta registrada (${action} ${entityType}).`,
        });
      } catch (err) {
        return JSON.stringify({ error: String(err) });
      }
    }

    return JSON.stringify({ error: "Tool not found" });
  };
}

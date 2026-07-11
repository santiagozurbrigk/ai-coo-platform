import { streamAgentMessage } from "@/lib/agent/stream-agent-message";
import { createSseEmitter, formatSseEvent } from "@/lib/agent/sse";
import type { AgentFlags } from "@/types/agent";
import type { PageContextState } from "@/lib/agent/page-context";

export const runtime = "nodejs";
export const maxDuration = 300;

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

export async function POST(req: Request) {
  if (req.signal.aborted) {
    return new Response(formatSseEvent("error", { message: "Cancelled" }), {
      status: 499,
      headers: SSE_HEADERS,
    });
  }

  let body: {
    conversationId?: string | null;
    content: string;
    contextStageId?: string | null;
    pageContext?: PageContextState | null;
    flags?: AgentFlags;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return new Response(formatSseEvent("error", { message: "JSON inválido" }), {
      status: 400,
      headers: SSE_HEADERS,
    });
  }

  if (!body.content?.trim()) {
    return new Response(formatSseEvent("error", { message: "Mensaje vacío" }), {
      status: 400,
      headers: SSE_HEADERS,
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const enqueue = (chunk: string) => {
        if (req.signal.aborted) return;
        controller.enqueue(encoder.encode(chunk));
      };
      const emitter = createSseEmitter(enqueue);

      void streamAgentMessage({
        conversationId: body.conversationId,
        content: body.content,
        contextStageId: body.contextStageId,
        pageContext: body.pageContext ?? null,
        flags: body.flags,
        emitter,
        signal: req.signal,
      })
        .then(() => {
          if (!req.signal.aborted) {
            controller.close();
          }
        })
        .catch((error) => {
          if (req.signal.aborted) {
            emitter.emit("error", { message: "Cancelled" });
          } else {
            const message =
              error instanceof Error ? error.message : "Error desconocido";
            emitter.emit("error", { message });
          }
          controller.close();
        });
    },
    cancel() {
      // Client disconnected
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}

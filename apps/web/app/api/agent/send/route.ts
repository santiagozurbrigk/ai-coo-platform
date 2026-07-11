import { NextResponse } from "next/server";
import { sendAgentMessageAction } from "@/app/agent/actions";
import type { AgentFlags } from "@/types/agent";
import type { PageContextState } from "@/lib/agent/page-context";

export async function POST(req: Request) {
  if (req.signal.aborted) {
    return NextResponse.json({ error: "Cancelled" }, { status: 499 });
  }

  try {
    const body = (await req.json()) as {
      conversationId?: string | null;
      content: string;
      contextStageId?: string | null;
      pageContext?: PageContextState | null;
      flags?: AgentFlags;
    };

    if (!body.content?.trim()) {
      return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 });
    }

    const result = await sendAgentMessageAction({
      conversationId: body.conversationId,
      content: body.content,
      contextStageId: body.contextStageId,
      pageContext: body.pageContext ?? null,
      flags: body.flags,
    });

    if (req.signal.aborted) {
      return NextResponse.json({ error: "Cancelled" }, { status: 499 });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export type AgentSseEventName =
  | "delta"
  | "tool_start"
  | "tool_end"
  | "done"
  | "error";

export type AgentSseEmitter = {
  emit: (event: AgentSseEventName, data: Record<string, unknown>) => void;
};

export function formatSseEvent(
  event: AgentSseEventName,
  data: Record<string, unknown>
): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function createSseEmitter(
  enqueue: (chunk: string) => void
): AgentSseEmitter {
  return {
    emit(event, data) {
      enqueue(formatSseEvent(event, data));
    },
  };
}

/** Parsea un buffer SSE acumulado y devuelve eventos completos + resto. */
export function parseSseBuffer(buffer: string): {
  events: Array<{ event: string; data: Record<string, unknown> }>;
  rest: string;
} {
  const events: Array<{ event: string; data: Record<string, unknown> }> = [];
  const blocks = buffer.split("\n\n");
  const rest = blocks.pop() ?? "";

  for (const block of blocks) {
    if (!block.trim()) continue;
    let eventName = "message";
    let dataLine = "";
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLine += line.slice(5).trim();
      }
    }
    if (!dataLine) continue;
    try {
      events.push({
        event: eventName,
        data: JSON.parse(dataLine) as Record<string, unknown>,
      });
    } catch {
      // ignorar bloques malformados
    }
  }

  return { events, rest };
}

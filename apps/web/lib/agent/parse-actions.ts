export type ParsedAgentAction = {
  type: string;
  data: Record<string, unknown>;
};

const ACTION_REGEX = /\[ACTION:(\w+):(\{[\s\S]*?\})\]/g;

export function parseAgentActions(response: string): ParsedAgentAction[] {
  const actions: ParsedAgentAction[] = [];
  let match: RegExpExecArray | null;

  while ((match = ACTION_REGEX.exec(response)) !== null) {
    try {
      actions.push({
        type: match[1]!,
        data: JSON.parse(match[2]!) as Record<string, unknown>,
      });
    } catch {
      console.error("[parseAgentActions] Failed to parse action payload");
    }
  }

  return actions;
}

export function cleanAgentResponse(response: string): string {
  return response.replace(/\[ACTION:\w+:\{[\s\S]*?\}\]/g, "").trim();
}

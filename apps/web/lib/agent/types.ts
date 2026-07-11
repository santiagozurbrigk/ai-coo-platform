export type AgentStatus =
  | "idle"
  | "thinking"
  | "generating"
  | "paused"
  | "complete"
  | "error"
  | "cancelled";

export function isAgentBusy(status: AgentStatus): boolean {
  return status === "thinking" || status === "generating";
}

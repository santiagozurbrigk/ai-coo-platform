"use server";

import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/**
 * Upserts a single node position in business_graph_node_positions.
 * Called on every onNodeDragStop in the graph view.
 */
export async function saveGraphNodePositionAction(
  nodeKey: string,
  x: number,
  y: number
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  if (!nodeKey || typeof x !== "number" || typeof y !== "number") return;

  try {
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    await supabase.from("business_graph_node_positions").upsert(
      {
        organization_id: organizationId,
        node_key: nodeKey,
        x,
        y,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,node_key" }
    );
  } catch {
    // Non-critical — position saving should never break the UI
  }
}

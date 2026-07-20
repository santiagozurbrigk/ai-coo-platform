export const dynamic = "force-dynamic";

import { FinanceOverview } from "@/components/finance/finance-overview";
import { createAdminClient } from "@/lib/supabase/admin";
import { tryRequireOrganizationId } from "@/lib/auth/bootstrap";
import type { ImportedTransaction } from "@/app/finance/actions";

async function getImportedTransactions(): Promise<ImportedTransaction[]> {
  try {
    const organizationId = await tryRequireOrganizationId();
    if (!organizationId) return [];

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("import_finance_rows")
      .select(
        "id, date, description, amount_usd, amount_local, category, client_name, closer_name, notes, import_batch_id, created_at"
      )
      .eq("organization_id", organizationId)
      .order("date", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[finance/page] import_finance_rows:", error.message);
      return [];
    }

    return (data ?? []).map((r) => ({
      id: r.id,
      date: r.date,
      description: r.description,
      amountUsd: r.amount_usd ?? null,
      amountLocal: r.amount_local ?? null,
      category: r.category ?? null,
      clientName: r.client_name ?? null,
      closerName: r.closer_name ?? null,
      notes: r.notes ?? null,
      importBatchId: r.import_batch_id,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("[finance/page] getImportedTransactions:", err);
    return [];
  }
}

export default async function FinancePage() {
  const importedTransactions = await getImportedTransactions();
  return <FinanceOverview importedTransactions={importedTransactions} />;
}

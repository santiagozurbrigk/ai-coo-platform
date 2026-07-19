import { FinanceOverview } from "@/components/finance/finance-overview";
import { listImportedTransactionsAction } from "@/app/finance/actions";

export default async function FinancePage() {
  const importedTransactions = await listImportedTransactionsAction();
  return <FinanceOverview importedTransactions={importedTransactions} />;
}

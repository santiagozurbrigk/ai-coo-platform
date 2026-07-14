import { Phone } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SalesCallsList } from "@/components/sales/sales-calls-list";
import { getSalesCallsAction } from "@/app/fathom/actions";

export default async function LlamadasVentaPage() {
  const calls = await getSalesCallsAction();

  return (
    <div className="space-y-6">
      <PageHeader description="Llamadas de cierre grabadas con Fathom — análisis IA por llamada" />
      <SalesCallsList calls={calls} />
    </div>
  );
}

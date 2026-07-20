export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/shared/page-header";
import { ImportWizard } from "@/components/operations/import-wizard";
import { listImportBatchesAction } from "@/app/operations/import-actions";

export const metadata = { title: "Importar datos históricos" };

export default async function ImportarPage() {
  const pastBatches = await listImportBatchesAction();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar datos históricos"
        description="Subí tu planilla de Excel o CSV y la IA mapeará las columnas automáticamente."
      />
      <ImportWizard pastBatches={pastBatches} />
    </div>
  );
}

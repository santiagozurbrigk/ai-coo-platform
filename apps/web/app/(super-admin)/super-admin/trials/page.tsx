import { TrialsTable } from "@/components/super-admin/trials-table";
import { loadTrialLeads } from "@/lib/super-admin/waitlist-queries";

export default async function SuperAdminTrialsPage() {
  const leads = await loadTrialLeads();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Pruebas gratis</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Leads que completaron el formulario post-Calendly en /prueba.
        </p>
      </div>
      <TrialsTable leads={leads} />
    </div>
  );
}

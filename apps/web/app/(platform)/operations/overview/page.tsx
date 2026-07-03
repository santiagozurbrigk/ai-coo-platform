import { getWeeklyReportAction } from "@/app/operations/actions";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { computeDepartmentStatuses } from "@/lib/executive-reports/compute-departments";
import { departmentStatusesToOperationsDepartments } from "@/lib/operations/map-weekly-report";
import { mockOperationsOverview } from "@/mocks/operations-overview";
import { OperationsOverview } from "@/components/operations/operations-overview";
import { PageHeader } from "@/components/shared/page-header";
import type { OperationsDepartment } from "@/types/operations-overview";

async function loadDepartments(): Promise<OperationsDepartment[]> {
  if (!isSupabaseConfigured()) {
    return mockOperationsOverview.departments;
  }

  try {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const statuses = await computeDepartmentStatuses(admin, organizationId);
    return departmentStatusesToOperationsDepartments(statuses);
  } catch (error) {
    console.error("[OperationsOverviewPage] loadDepartments", error);
    return [];
  }
}

export default async function OperationsOverviewPage() {
  const [weeklyReport, departments] = await Promise.all([
    getWeeklyReportAction(),
    loadDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader description="Salud operativa y capacidad del equipo" />
      <OperationsOverview weeklyReport={weeklyReport} departments={departments} />
    </div>
  );
}

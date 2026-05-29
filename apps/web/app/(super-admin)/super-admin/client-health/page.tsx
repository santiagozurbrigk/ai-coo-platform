import Link from "next/link";
import { Badge, GlassPanel } from "@ai-coo/ui";
import { loadClientHealthOverview } from "@/lib/super-admin/client-health";
import { paths } from "@/routes";

export default async function SuperAdminClientHealthPage() {
  const orgs = await loadClientHealthOverview();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Salud de Clientes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Problemas detectados vía Fathom y formularios — todas las organizaciones.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {orgs.map((org) => (
          <GlassPanel key={org.orgId} className="p-5 space-y-4">
            <div>
              <p className="font-semibold">{org.orgName}</p>
              <p className="text-xs text-muted-foreground">
                {org.activeClients} clientes activos
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Problemas activos</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {org.activeProblems}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Resueltos este mes</dt>
                <dd className="text-lg font-semibold tabular-nums">
                  {org.resolvedThisMonth}
                </dd>
              </div>
            </dl>
            {org.topProblems.length > 0 && (
              <ul className="space-y-1 text-sm">
                {org.topProblems.map((p) => (
                  <li key={p.description} className="flex justify-between gap-2">
                    <span className="text-muted-foreground truncate">
                      {p.description}
                    </span>
                    <Badge variant="secondary">{p.count}</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={paths.superAdmin.organizationDetail(org.orgId)}
              className="text-xs text-primary"
            >
              Ver organización →
            </Link>
          </GlassPanel>
        ))}
      </div>
    </div>
  );
}

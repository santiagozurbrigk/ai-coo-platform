"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, DataTable, Input } from "@ai-coo/ui";
import { paths } from "@/routes";
import { es } from "@/lib/locale/es";
import type { AdminOrganizationListRow } from "@/types/super-admin";
import { setOrganizationStatusAction } from "@/app/super-admin/actions";

type Filter = "all" | "active" | "inactive";

const STATUS_LABEL: Record<string, string> = {
  active: es.status.org.active,
  inactive: "Inactiva",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function OrganizationsList({
  organizations,
}: {
  organizations: AdminOrganizationListRow[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return organizations.filter((org) => {
      if (filter === "active" && org.status !== "active") return false;
      if (filter === "inactive" && org.status !== "inactive") return false;
      if (!q) return true;
      return (
        org.name.toLowerCase().includes(q) ||
        org.founderEmail.toLowerCase().includes(q) ||
        org.founderName.toLowerCase().includes(q)
      );
    });
  }, [organizations, filter, search]);

  async function toggleStatus(org: AdminOrganizationListRow) {
    setPendingId(org.id);
    await setOrganizationStatusAction(org.id, org.status !== "active");
    setPendingId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Todas"],
              ["active", "Activas"],
              ["inactive", "Inactivas"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={filter === key ? "default" : "outline"}
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>
        <Button asChild size="sm">
          <Link href={paths.superAdmin.organizationsNew}>Crear cuenta</Link>
        </Button>
      </div>

      <Input
        placeholder="Buscar por nombre o email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <DataTable
        title="Organizaciones"
        columns={[
          { key: "name", header: "Nombre", cell: (r) => r.name },
          {
            key: "founder",
            header: "Founder",
            cell: (r) => (
              <span className="text-sm">
                {r.founderName}
                <br />
                <span className="text-muted-foreground">{r.founderEmail}</span>
              </span>
            ),
          },
          {
            key: "status",
            header: "Estado",
            cell: (r) => (
              <Badge variant={r.status === "active" ? "success" : "secondary"}>
                {STATUS_LABEL[r.status]}
              </Badge>
            ),
          },
          {
            key: "created",
            header: "Creación",
            cell: (r) => formatDate(r.createdAt),
          },
          {
            key: "login",
            header: "Último login",
            cell: (r) => formatDate(r.founderLastLogin),
          },
          {
            key: "conv",
            header: "Conv. mes",
            cell: (r) => r.conversationsThisMonth,
          },
          {
            key: "deals",
            header: "Deals mes",
            cell: (r) => r.dealsClosedThisMonth,
          },
          {
            key: "bill",
            header: "Facturación mes",
            cell: (r) => r.billingThisMonthLabel,
          },
          {
            key: "actions",
            header: "Acciones",
            cell: (r) => (
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={paths.superAdmin.organizationDetail(r.id)}>
                    Ver detalle
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pendingId === r.id}
                  onClick={() => toggleStatus(r)}
                >
                  {r.status === "active" ? "Desactivar" : "Activar"}
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        keyExtractor={(r) => r.id}
      />
    </div>
  );
}

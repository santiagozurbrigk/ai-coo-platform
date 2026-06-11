"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, DataTable, Input } from "@ai-coo/ui";
import { paths } from "@/routes";
import { es } from "@/lib/locale/es";
import type { AdminOrganizationListRow } from "@/types/super-admin";
import { setOrganizationStatusAction } from "@/app/super-admin/actions";

type Filter = "all" | "active" | "inactive" | "trial";

const STATUS_LABEL: Record<string, string> = {
  active: es.status.org.active,
  inactive: "Inactivo",
  trial: es.status.org.trial,
};

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
  trial: "Trial",
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
      if (filter === "trial" && org.status !== "trial") return false;
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
              ["trial", "Trial"],
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
            key: "plan",
            header: "Plan",
            cell: (r) => PLAN_LABEL[r.plan] ?? r.plan,
          },
          {
            key: "status",
            header: "Estado",
            cell: (r) => (
              <Badge
                variant={
                  r.status === "active"
                    ? "success"
                    : r.status === "trial"
                      ? "warning"
                      : "secondary"
                }
              >
                {STATUS_LABEL[r.status]}
              </Badge>
            ),
          },
          {
            key: "users",
            header: "Usuarios",
            cell: (r) => r.usersCount,
          },
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
            key: "created",
            header: "Creación",
            cell: (r) => formatDate(r.createdAt),
          },
          {
            key: "activity",
            header: "Última actividad",
            cell: (r) => formatDate(r.lastActivityAt),
          },
          {
            key: "mrr",
            header: "MRR",
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
                <Button asChild size="sm" variant="ghost">
                  <Link href={paths.superAdmin.organizationDetail(r.id)}>
                    Editar
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={pendingId === r.id}
                  onClick={() => toggleStatus(r)}
                >
                  {pendingId === r.id
                    ? "Procesando…"
                    : r.status === "active" || r.status === "trial"
                      ? "Suspender"
                      : "Activar"}
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

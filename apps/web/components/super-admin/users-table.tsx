"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, DataTable, Input } from "@ai-coo/ui";
import { paths } from "@/routes";
import { deactivateUserAction } from "@/app/super-admin/actions";
import type { AdminUserRow } from "@/types/super-admin";

type RoleFilter = "all" | "founder" | "admin" | "other";

const ROLE_LABEL: Record<string, string> = {
  founder: "Founder",
  admin: "Admin",
  project_manager: "Gestor de proyecto",
  setter: "Setter",
  operator: "Operador",
  viewer: "Viewer",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("es", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function UsersTable({ users }: { users: AdminUserRow[] }) {
  const [filter, setFilter] = useState<RoleFilter>("all");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const organizations = useMemo(() => {
    const names = new Map<string, string>();
    for (const user of users) {
      names.set(user.organizationId, user.organizationName);
    }
    return [...names.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (orgFilter !== "all" && u.organizationId !== orgFilter) return false;
      if (filter === "founder" && u.role !== "founder") return false;
      if (filter === "admin" && u.role !== "admin") return false;
      if (
        filter === "other" &&
        (u.role === "founder" || u.role === "admin")
      ) {
        return false;
      }
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.organizationName.toLowerCase().includes(q)
      );
    });
  }, [users, filter, orgFilter, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "Todos"],
            ["founder", "Founders"],
            ["admin", "Admins"],
            ["other", "Otros roles"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "default" : "outline"}
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs text-muted-foreground" htmlFor="org-filter">
          Organización
        </label>
        <select
          id="org-filter"
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="all">Todas</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      <Input
        placeholder="Buscar por nombre, email u organización…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />
      <DataTable
        title="Usuarios"
        columns={[
          { key: "name", header: "Nombre", cell: (r) => r.name },
          { key: "email", header: "Email", cell: (r) => r.email },
          {
            key: "org",
            header: "Organización",
            cell: (r) => r.organizationName,
          },
          {
            key: "role",
            header: "Rol",
            cell: (r) => ROLE_LABEL[r.role] ?? r.role,
          },
          {
            key: "status",
            header: "Estado",
            cell: (r) => (
              <Badge variant={r.status === "active" ? "success" : "secondary"}>
                {r.status === "active" ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          {
            key: "login",
            header: "Último login",
            cell: (r) => formatDate(r.lastLogin),
          },
          {
            key: "actions",
            header: "Acciones",
            cell: (r) => (
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link
                    href={paths.superAdmin.organizationDetail(
                      r.organizationId
                    )}
                  >
                    Ver org
                  </Link>
                </Button>
                {r.status === "active" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pendingId === r.id}
                    onClick={async () => {
                      setPendingId(r.id);
                      await deactivateUserAction(r.id);
                      setPendingId(null);
                    }}
                  >
                    Desactivar
                  </Button>
                )}
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

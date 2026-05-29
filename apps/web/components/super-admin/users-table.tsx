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
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
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
  }, [users, filter, search]);

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

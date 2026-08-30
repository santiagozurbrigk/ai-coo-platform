"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Badge, Button, Input } from "@ai-coo/ui";
import {
  emptyPermissions,
  getPermissionModuleLabel,
  MODULE_GROUPS,
  PERMISSION_LEVELS,
} from "@/constants/permission-modules";
import { createCustomRoleAction } from "@/app/team/actions";
import { useToast } from "@/providers/toast-provider";
import type { PermissionLevel } from "@/types/team";
import type { PermissionModuleId } from "@/constants/permission-modules";
import { PermissionRow } from "./permission-row";

export function CustomRoleForm({ onCreated }: { onCreated?: () => void }) {
  const { push } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState(emptyPermissions);
  const [pending, startTransition] = useTransition();

  const setLevel = (moduleId: PermissionModuleId, level: PermissionLevel) => {
    setPermissions((prev) => ({ ...prev, [moduleId]: level }));
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createCustomRoleAction({
        name: name.trim(),
        description: description.trim() || undefined,
        permissions,
      });

      if (!result.success) {
        push({ title: "Error", description: result.error });
        return;
      }

      push({ title: "Rol creado", variant: "success" });
      setName("");
      setDescription("");
      setPermissions(emptyPermissions());
      onCreated?.();
    });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleCreate();
      }}
      className="rounded-xl border border-border/60 bg-card/40"
    >
      <div className="sticky top-0 z-10 mb-6 flex items-center justify-between border-b border-border/40 bg-background px-4 py-4 md:px-6">
        <div>
          <h2 className="text-[15px] font-medium text-foreground">
            Crear rol personalizado
          </h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">
            Definí el nombre y los permisos de acceso por módulo
          </p>
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={!name.trim() || pending}
          className="gap-1.5 bg-brand-600 text-white hover:bg-brand-700"
        >
          <Check className="h-3.5 w-3.5" />
          {pending ? "Guardando…" : "Guardar rol"}
        </Button>
      </div>

      <div className="space-y-6 px-4 pb-6 md:px-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="role-name"
              className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              Nombre del rol
            </label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej: Setter Senior"
              disabled={pending}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="role-description"
              className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              Descripción (opcional)
            </label>
            <Input
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ej: Acceso a ventas y clientes"
              disabled={pending}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="mb-2 grid min-w-[520px] grid-cols-[1fr_110px_110px_110px] px-3">
            <div />
            {PERMISSION_LEVELS.map((col) => (
              <div
                key={col.value}
                className="text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {col.label}
              </div>
            ))}
          </div>

          {MODULE_GROUPS.map((group) => (
            <div key={group.label} className="mb-3 min-w-[520px]">
              <div className="mb-1 rounded-lg border border-border/40 bg-muted/30 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
                {group.label}
              </div>
              {group.moduleIds.map((moduleId) => (
                <PermissionRow
                  key={moduleId}
                  label={getPermissionModuleLabel(moduleId)}
                  value={permissions[moduleId] ?? "none"}
                  onChange={(val) => setLevel(moduleId, val)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}

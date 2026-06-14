"use client";

import { useTransition } from "react";
import { Badge, Button } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import { deleteCustomRoleAction } from "@/app/team/actions";
import {
  getPermissionModuleLabel,
  PERMISSION_LEVELS,
} from "@/constants/permission-modules";
import type { CustomRole } from "@/types/team";
import type { PermissionModuleId } from "@/constants/permission-modules";

export function CustomRolesList({
  roles,
  onUpdated,
  canManage = false,
}: {
  roles: CustomRole[];
  onUpdated?: () => void;
  canManage?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (roles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay roles configurados aún. Se crearán automáticamente al cargar la
        página si la migración está aplicada.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {roles.map((role) => (
        <Panel key={role.id} title={role.name}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {role.isDefault ? (
              <Badge variant="outline" className="text-[10px]">
                Default
              </Badge>
            ) : null}
            {role.description ? (
              <p className="text-sm text-muted-foreground">{role.description}</p>
            ) : null}
          </div>
          <ul className="space-y-1 text-xs">
            {Object.entries(role.permissions)
              .filter(([, level]) => level !== "none")
              .map(([mod, level]) => (
                <li key={mod} className="text-muted-foreground">
                  {getPermissionModuleLabel(mod as PermissionModuleId)}:{" "}
                  {PERMISSION_LEVELS.find((l) => l.value === level)?.label ??
                    level}
                </li>
              ))}
          </ul>
          {canManage && !role.isDefault ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 h-7 text-xs"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteCustomRoleAction(role.id);
                  onUpdated?.();
                })
              }
            >
              Eliminar
            </Button>
          ) : null}
        </Panel>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button, FormField, Input, Textarea } from "@ai-coo/ui";
import { Panel } from "@/components/shared/panel";
import {
  emptyPermissions,
  PERMISSION_LEVELS,
  PERMISSION_MODULES,
} from "@/constants/permission-modules";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";
import type { PermissionLevel } from "@/types/team";
import type { PermissionModuleId } from "@/constants/permission-modules";

export function CustomRoleForm() {
  const { addCustomRole } = usePlatformData();
  const { push } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState(emptyPermissions);

  const setLevel = (moduleId: PermissionModuleId, level: PermissionLevel) => {
    setPermissions((prev) => ({ ...prev, [moduleId]: level }));
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    addCustomRole({
      id: `role-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      permissions,
    });
    push({ title: "Rol creado", variant: "success" });
    setName("");
    setDescription("");
    setPermissions(emptyPermissions());
  };

  return (
    <Panel title="Crear rol personalizado" contentClassName="space-y-4">
      <FormField label="Nombre del rol">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </FormField>
      <FormField label="Descripción (opcional)">
        <Textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </FormField>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-3 py-2 text-left font-medium">Módulo</th>
              {PERMISSION_LEVELS.map((l) => (
                <th key={l.value} className="px-2 py-2 text-center font-medium">
                  {l.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MODULES.map((mod) => (
              <tr key={mod.id} className="border-b border-border/50">
                <td className="px-3 py-2">{mod.label}</td>
                {PERMISSION_LEVELS.map((level) => (
                  <td key={level.value} className="px-2 py-2 text-center">
                    <input
                      type="radio"
                      name={`perm-${mod.id}`}
                      checked={permissions[mod.id] === level.value}
                      onChange={() => setLevel(mod.id, level.value)}
                      className="accent-primary"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button onClick={handleCreate} disabled={!name.trim()}>
        Crear rol
      </Button>
    </Panel>
  );
}

import { Panel } from "@/components/shared";
import type { RoleDefinition } from "@/types/team";

export function RolesGrid({ roles }: { roles: RoleDefinition[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {roles.map((role) => (
        <Panel key={role.role} title={role.label}>
          <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
          <ul className="space-y-1">
            {role.permissions.map((p) => (
              <li key={p} className="text-xs flex gap-2 before:content-['•'] before:text-primary">
                {p}
              </li>
            ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}

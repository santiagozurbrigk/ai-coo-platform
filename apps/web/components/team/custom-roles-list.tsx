import { Panel } from "@/components/shared/panel";
import type { CustomRole } from "@/types/team";
import { PERMISSION_LEVELS } from "@/constants/permission-modules";

export function CustomRolesList({ roles }: { roles: CustomRole[] }) {
  if (roles.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {roles.map((role) => (
        <Panel key={role.id} title={role.name}>
          {role.description && (
            <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
          )}
          <ul className="space-y-1 text-xs">
            {Object.entries(role.permissions)
              .filter(([, level]) => level !== "none")
              .map(([mod, level]) => (
                <li key={mod} className="text-muted-foreground">
                  {mod}:{" "}
                  {PERMISSION_LEVELS.find((l) => l.value === level)?.label ?? level}
                </li>
              ))}
          </ul>
        </Panel>
      ))}
    </div>
  );
}

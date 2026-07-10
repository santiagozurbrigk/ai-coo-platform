"use client";

import { useState, useTransition } from "react";
import {
  Badge,
  Button,
  DataTable,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import {
  deactivateMemberAction,
  updateMemberRoleAction,
} from "@/app/team/actions";
import { setMemberHourlyRateAction } from "@/app/workboard/actions";
import { es } from "@/lib/locale/es";
import { formatRelativeTime } from "@/lib/format";
import type { CustomRole, TeamMember } from "@/types/team";

const selectClass =
  "h-8 rounded-md border border-border bg-background px-2 text-xs dark:border-white/[0.08] dark:bg-[#1A1A1A]";

function MemberAvatar({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (member.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatarUrl}
        alt=""
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/15 text-[11px] font-medium text-violet-700 dark:text-violet-300">
      {initials}
    </div>
  );
}

function HourlyRateCell({
  member,
  canEditRates,
  onUpdated,
}: {
  member: TeamMember;
  canEditRates: boolean;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState(String(member.hourlyRate ?? ""));
  const [currency, setCurrency] = useState(member.hourlyRateCurrency ?? "USD");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canEditRates) {
    return member.hourlyRate != null ? (
      <span className="text-sm tabular-nums">
        {member.hourlyRate} {member.hourlyRateCurrency ?? "USD"}/h
      </span>
    ) : (
      <span className="text-xs text-muted-foreground">—</span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {member.hourlyRate != null ? (
          <span className="text-sm tabular-nums">
            {member.hourlyRate} {member.hourlyRateCurrency ?? "USD"}/h
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Sin configurar</span>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            setRate(String(member.hourlyRate ?? ""));
            setCurrency(member.hourlyRateCurrency ?? "USD");
            setError(null);
            setOpen(true);
          }}
        >
          Editar
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tarifa por hora — {member.name}</DialogTitle>
            <DialogDescription>
              Se usa para calcular el costo de las tareas en el reporte de
              tiempo del Workboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor={`rate-${member.id}`}>Tarifa por hora</Label>
              <Input
                id={`rate-${member.id}`}
                type="number"
                min={0}
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`currency-${member.id}`}>Moneda</Label>
              <select
                id={`currency-${member.id}`}
                className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </div>
            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const hourlyRate = Number(rate);
                  if (!Number.isFinite(hourlyRate) || hourlyRate < 0) {
                    setError("Ingresá una tarifa válida");
                    return;
                  }
                  try {
                    await setMemberHourlyRateAction({
                      memberId: member.id,
                      hourlyRate,
                      currency,
                    });
                    setOpen(false);
                    onUpdated();
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "No se pudo guardar"
                    );
                  }
                })
              }
            >
              {pending ? "Guardando…" : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MemberActions({
  member,
  canManage,
  onUpdated,
}: {
  member: TeamMember;
  canManage: boolean;
  onUpdated: () => void;
}) {
  const [pending, startTransition] = useTransition();

  if (!canManage) return null;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 text-xs"
      disabled={pending || member.status === "inactive"}
      onClick={() =>
        startTransition(async () => {
          await deactivateMemberAction(member.id);
          onUpdated();
        })
      }
    >
      Desactivar
    </Button>
  );
}

function RoleSelect({
  member,
  customRoles,
  canManage,
  onUpdated,
}: {
  member: TeamMember;
  customRoles: CustomRole[];
  canManage: boolean;
  onUpdated: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const assignableRoles = customRoles.filter((r) => !r.isDefault);

  if (member.role === "founder") {
    return <Badge variant="secondary">Fundador</Badge>;
  }

  if (!canManage) {
    return (
      <span className="text-sm">{member.customRoleName ?? "Sin rol asignado"}</span>
    );
  }

  if (assignableRoles.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">
        Creá un rol custom en la pestaña Roles
      </span>
    );
  }

  return (
    <select
      className={selectClass}
      value={member.customRoleId ?? ""}
      disabled={pending}
      onChange={(e) =>
        startTransition(async () => {
          await updateMemberRoleAction(member.id, {
            customRoleId: e.target.value || null,
          });
          onUpdated();
        })
      }
    >
      <option value="">Sin rol</option>
      {assignableRoles.map((role) => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  );
}

export function TeamMembersTable({
  members,
  customRoles,
  canEditRates = false,
  canManage = false,
  onUpdated,
}: {
  members: TeamMember[];
  customRoles: CustomRole[];
  canEditRates?: boolean;
  canManage?: boolean;
  onUpdated?: () => void;
}) {
  const refresh = () => onUpdated?.();

  return (
    <DataTable
      title="Miembros"
      columns={[
        {
          key: "avatar",
          header: "",
          cell: (r) => <MemberAvatar member={r} />,
        },
        { key: "name", header: "Nombre", cell: (r) => r.name },
        { key: "email", header: "Email", cell: (r) => r.email },
        {
          key: "role",
          header: "Rol",
          cell: (r) => (
            <RoleSelect
              member={r}
              customRoles={customRoles}
              canManage={canManage}
              onUpdated={refresh}
            />
          ),
        },
        {
          key: "hourlyRate",
          header: "Tarifa / hora",
          cell: (r) => (
            <HourlyRateCell
              member={r}
              canEditRates={canEditRates}
              onUpdated={refresh}
            />
          ),
        },
        {
          key: "status",
          header: "Estado",
          cell: (r) => (
            <Badge variant={r.status === "active" ? "success" : "secondary"}>
              {r.status === "active"
                ? es.status.member.active
                : es.status.member.inactive}
            </Badge>
          ),
        },
        {
          key: "login",
          header: "Último acceso",
          cell: (r) => formatRelativeTime(r.lastLogin),
        },
        {
          key: "actions",
          header: "Acciones",
          cell: (r) => (
            <MemberActions
              member={r}
              canManage={canManage}
              onUpdated={refresh}
            />
          ),
        },
      ]}
      data={members}
      keyExtractor={(r) => r.id}
    />
  );
}

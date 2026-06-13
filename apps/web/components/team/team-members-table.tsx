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
import { setMemberHourlyRateAction } from "@/app/workboard/actions";
import { es } from "@/lib/locale/es";
import { formatRelativeTime } from "@/lib/format";
import type { CustomRole, TeamMember } from "@/types/team";
import { USER_ROLES } from "@/constants/roles";

const selectClass =
  "h-8 rounded-md border border-border bg-background px-2 text-xs";

const roleLabel = (role: TeamMember["role"]) =>
  USER_ROLES.find((r) => r.value === role)?.label ?? role;

const STATUS_LABEL = {
  active: es.status.member.active,
  away: es.status.member.away,
  inactive: es.status.member.inactive,
};

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

export function TeamMembersTable({
  members,
  customRoles,
  canEditRates = false,
  onRatesUpdated,
}: {
  members: TeamMember[];
  customRoles: CustomRole[];
  canEditRates?: boolean;
  onRatesUpdated?: () => void;
}) {
  const [, setRefreshKey] = useState(0);

  return (
    <DataTable
      title="Miembros"
      columns={[
        { key: "name", header: "Nombre", cell: (r) => r.name },
        { key: "email", header: "Email", cell: (r) => r.email },
        {
          key: "role",
          header: "Rol asignado",
          cell: () => (
            <select className={selectClass} defaultValue="">
              <option value="">
                {customRoles.length === 0
                  ? "Sin roles creados aún"
                  : "Seleccionar rol…"}
              </option>
              {customRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          ),
        },
        {
          key: "systemRole",
          header: "Rol sistema",
          cell: (r) => roleLabel(r.role),
        },
        {
          key: "hourlyRate",
          header: "Tarifa / hora",
          cell: (r) => (
            <HourlyRateCell
              member={r}
              canEditRates={canEditRates}
              onUpdated={() => {
                setRefreshKey((k) => k + 1);
                onRatesUpdated?.();
              }}
            />
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
          key: "login",
          header: "Último acceso",
          cell: (r) => formatRelativeTime(r.lastLogin),
        },
      ]}
      data={members}
      keyExtractor={(r) => r.id}
    />
  );
}

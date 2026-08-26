"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  connectGHLAction,
  getGHLIntegrationStatusAction,
  syncGHLAppointmentsAction,
  updateGHLCalendarsAction,
  validateGHLKeyAction,
  type GHLIntegrationStatus,
} from "@/app/ghl/actions";
import type { GHLCalendar } from "@/lib/ghl/client";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";
import { usePlatformData } from "@/providers";

// ─── Paso 1: Credenciales ─────────────────────────────────────────────────────

function StepCredentials({
  onValidated,
}: {
  onValidated: (
    apiKey: string,
    locationId: string,
    calendars: GHLCalendar[]
  ) => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [locationId, setLocationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const handleValidate = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await validateGHLKeyAction(apiKey, locationId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      push({
        title: "Credenciales válidas",
        description: `${result.calendars.length} calendario${result.calendars.length === 1 ? "" : "s"} encontrado${result.calendars.length === 1 ? "" : "s"}.`,
        variant: "success",
      });
      onValidated(apiKey.trim(), locationId.trim(), result.calendars);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ghl-token">Private Integration Token</Label>
        <Input
          id="ghl-token"
          type="password"
          placeholder="eyJhbGc..."
          value={apiKey}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          GHL → Configuración → Integraciones Privadas → Crear token
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ghl-location">Location ID</Label>
        <Input
          id="ghl-location"
          placeholder="Ej: xxxxxxxxxxxxxxxxxxxxxxxx"
          value={locationId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocationId(e.target.value)}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Visible en la URL de GHL: /location/&#123;locationId&#125;/
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          onClick={handleValidate}
          disabled={loading || !apiKey.trim() || !locationId.trim()}
        >
          {loading ? "Validando…" : "Validar y continuar"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── Paso 2: Elegir calendarios (multi-selección) ─────────────────────────────

function StepSelectCalendar({
  apiKey,
  locationId,
  calendars,
  currentSelectedIds,
  onConnected,
}: {
  apiKey: string;
  locationId: string;
  calendars: GHLCalendar[];
  currentSelectedIds: string[];
  onConnected: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(currentSelectedIds.length ? currentSelectedIds : calendars.slice(0, 1).map((c) => c.id))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const toggleCalendar = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev; // al menos 1 requerido
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!selected.size) return;
    setError(null);
    setLoading(true);
    try {
      const result = await connectGHLAction(apiKey, locationId, calendars, [...selected]);
      if (!result.success) {
        setError(result.error ?? "Error al guardar");
        return;
      }
      push({
        title: "GoHighLevel conectado",
        description:
          selected.size === 1
            ? "El calendario se sincronizará automáticamente cada hora."
            : `${selected.size} calendarios se sincronizarán automáticamente cada hora.`,
        variant: "success",
      });
      onConnected();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>
          Seleccioná los calendarios a sincronizar
          <span className="ml-1 text-xs text-muted-foreground">(podés elegir varios)</span>
        </Label>
        <div className="space-y-1.5 max-h-52 overflow-y-auto rounded-lg border border-border p-2">
          {calendars.map((cal) => {
            const checked = selected.has(cal.id);
            return (
              <label
                key={cal.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCalendar(cal.id)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <span className={checked ? "font-medium" : ""}>{cal.name}</span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          {selected.size === 0
            ? "Seleccioná al menos un calendario."
            : selected.size === 1
            ? "1 calendario seleccionado"
            : `${selected.size} calendarios seleccionados`}
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          onClick={handleSave}
          disabled={loading || selected.size === 0}
        >
          {loading ? "Guardando…" : "Conectar GHL"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── Panel de gestión (conectado) ─────────────────────────────────────────────

function ManagePanel({
  status,
  onSynced,
  onCalendarsChanged,
}: {
  status: GHLIntegrationStatus;
  onSynced: () => void;
  onCalendarsChanged: () => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [savingCalendars, setSavingCalendars] = useState(false);
  const [localSelected, setLocalSelected] = useState<Set<string>>(
    () => new Set(status.selectedCalendarIds)
  );
  const { push } = useToast();
  const { refreshClosingCalls } = usePlatformData();

  // Sincronizar estado local si cambia el status externo
  useEffect(() => {
    setLocalSelected(new Set(status.selectedCalendarIds));
  }, [status.selectedCalendarIds]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncGHLAppointmentsAction();
      if (!result.success) {
        push({ title: "Error al sincronizar GHL", description: result.error });
        return;
      }
      const { fetched, inserted, updated } = result.data;
      await refreshClosingCalls();
      push({
        title: "GHL sincronizado",
        description: `${fetched} citas · ${inserted} nuevas · ${updated} actualizadas`,
        variant: "success",
      });
      onSynced();
    } catch (e) {
      push({
        title: "Error al sincronizar GHL",
        description: e instanceof Error ? e.message : "Error inesperado",
      });
    } finally {
      setSyncing(false);
    }
  };

  const toggleCalendar = (id: string) => {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev; // mínimo 1
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const hasChanges = (() => {
    if (localSelected.size !== status.selectedCalendarIds.length) return true;
    return status.selectedCalendarIds.some((id) => !localSelected.has(id));
  })();

  const handleSaveCalendars = async () => {
    setSavingCalendars(true);
    try {
      const result = await updateGHLCalendarsAction([...localSelected]);
      if (!result.success) {
        push({ title: "Error al actualizar calendarios", description: result.error });
        return;
      }
      push({ title: "Calendarios actualizados", variant: "success" });
      onCalendarsChanged();
    } finally {
      setSavingCalendars(false);
    }
  };

  const activeCalendars = status.connectedCalendars.filter((c) =>
    status.selectedCalendarIds.includes(c.id)
  );

  return (
    <div className="space-y-4">
      {/* Estado */}
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium">
            {activeCalendars.length === 1
              ? "Calendario activo"
              : `${activeCalendars.length} calendarios activos`}
          </p>
          <p className="text-xs text-muted-foreground">
            {activeCalendars.length === 0
              ? "Sin seleccionar"
              : activeCalendars.map((c) => c.name).join(", ")}
          </p>
        </div>
        <Badge variant="success">Conectado</Badge>
      </div>

      {/* Sincronización manual */}
      <div className="space-y-1">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? "Sincronizando…" : "Sincronizar ahora"}
        </Button>
        {status.lastSyncAt ? (
          <p className="text-center text-xs text-muted-foreground">
            Último sync:{" "}
            {new Date(status.lastSyncAt).toLocaleString("es-AR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        ) : null}
      </div>

      {/* Gestión de calendarios (visible si hay más de 1 disponible) */}
      {status.connectedCalendars.length > 1 ? (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Calendarios sincronizados</p>
          <div className="space-y-1.5 max-h-44 overflow-y-auto rounded-lg border border-border p-2">
            {status.connectedCalendars.map((cal) => {
              const checked = localSelected.has(cal.id);
              return (
                <label
                  key={cal.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCalendar(cal.id)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className={checked ? "font-medium" : "text-muted-foreground"}>
                    {cal.name}
                  </span>
                </label>
              );
            })}
          </div>
          {hasChanges ? (
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={handleSaveCalendars}
              disabled={savingCalendars || localSelected.size === 0}
            >
              {savingCalendars ? "Guardando…" : "Guardar selección"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ─── Dialog principal ─────────────────────────────────────────────────────────

type Step = "credentials" | "calendar";

export function GHLConnectDialog({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [status, setStatus] = useState<GHLIntegrationStatus | null>(null);
  const [pendingApiKey, setPendingApiKey] = useState("");
  const [pendingLocationId, setPendingLocationId] = useState("");
  const [pendingCalendars, setPendingCalendars] = useState<GHLCalendar[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getGHLIntegrationStatusAction();
      setStatus(next);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setStep("credentials");
    void loadStatus();
  }, [open, loadStatus]);

  const handleValidated = (
    apiKey: string,
    locationId: string,
    calendars: GHLCalendar[]
  ) => {
    setPendingApiKey(apiKey);
    setPendingLocationId(locationId);
    setPendingCalendars(calendars);
    setStep("calendar");
  };

  const handleConnected = () => {
    onConnected?.();
    void loadStatus();
    onOpenChange(false);
    const timer = window.setTimeout(() => router.refresh(), 300);
    return () => window.clearTimeout(timer);
  };

  const isConnected = status?.connected ?? false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>GoHighLevel</DialogTitle>
          <DialogDescription>
            {isConnected
              ? "Gestioná los calendarios sincronizados de GHL."
              : "Conectá uno o más calendarios de GoHighLevel para importar citas al módulo de Closing."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Cargando…
          </p>
        ) : isConnected ? (
          <ManagePanel
            status={status!}
            onSynced={() => void loadStatus()}
            onCalendarsChanged={() => void loadStatus()}
          />
        ) : step === "credentials" ? (
          <StepCredentials onValidated={handleValidated} />
        ) : (
          <StepSelectCalendar
            apiKey={pendingApiKey}
            locationId={pendingLocationId}
            calendars={pendingCalendars}
            currentSelectedIds={status?.selectedCalendarIds ?? []}
            onConnected={handleConnected}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

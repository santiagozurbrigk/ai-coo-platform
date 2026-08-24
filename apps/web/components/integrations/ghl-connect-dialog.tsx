"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  connectGHLAction,
  getGHLIntegrationStatusAction,
  syncGHLAppointmentsAction,
  updateGHLCalendarAction,
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
          onChange={(e) => setApiKey(e.target.value)}
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
          onChange={(e) => setLocationId(e.target.value)}
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

// ─── Paso 2: Elegir calendario ────────────────────────────────────────────────

function StepSelectCalendar({
  apiKey,
  locationId,
  calendars,
  currentCalendarId,
  onConnected,
}: {
  apiKey: string;
  locationId: string;
  calendars: GHLCalendar[];
  currentCalendarId: string | null;
  onConnected: () => void;
}) {
  const [selected, setSelected] = useState<string>(
    currentCalendarId ?? calendars[0]?.id ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const handleSave = async () => {
    if (!selected) return;
    setError(null);
    setLoading(true);
    try {
      const result = await connectGHLAction(apiKey, locationId, calendars, selected);
      if (!result.success) {
        setError(result.error ?? "Error al guardar");
        return;
      }
      push({
        title: "GoHighLevel conectado",
        description: "El calendario se sincronizará automáticamente cada hora.",
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
        <Label>Seleccioná el calendario a sincronizar</Label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-lg border border-border p-1">
          {calendars.map((cal) => (
            <button
              key={cal.id}
              type="button"
              onClick={() => setSelected(cal.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                selected === cal.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {cal.name}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <DialogFooter>
        <Button
          type="button"
          onClick={handleSave}
          disabled={loading || !selected}
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
  onCalendarChanged,
}: {
  status: GHLIntegrationStatus;
  onSynced: () => void;
  onCalendarChanged: () => void;
}) {
  const [syncing, setSyncing] = useState(false);
  const [changingCalendar, setChangingCalendar] = useState(false);
  const { push } = useToast();
  const { refreshClosingCalls } = usePlatformData();

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

  const handleChangeCalendar = async (calendarId: string) => {
    const result = await updateGHLCalendarAction(calendarId);
    if (!result.success) {
      push({ title: "Error al cambiar calendario", description: result.error });
      return;
    }
    push({ title: "Calendario actualizado", variant: "success" });
    onCalendarChanged();
  };

  const activeCalendar = status.connectedCalendars.find(
    (c) => c.id === status.defaultCalendarId
  );

  return (
    <div className="space-y-4">
      {/* Estado */}
      <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Calendario activo</p>
          <p className="text-xs text-muted-foreground">
            {activeCalendar?.name ?? status.defaultCalendarId ?? "Sin seleccionar"}
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

      {/* Cambiar calendario */}
      {status.connectedCalendars.length > 1 ? (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Cambiar calendario</p>
          <div className="space-y-1 max-h-36 overflow-y-auto rounded-lg border border-border p-1">
            {status.connectedCalendars.map((cal) => (
              <button
                key={cal.id}
                type="button"
                onClick={() => void handleChangeCalendar(cal.id)}
                className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
                  cal.id === status.defaultCalendarId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                {cal.name}
              </button>
            ))}
          </div>
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
              ? "Gestioná tu integración de calendario GHL."
              : "Conectá tu calendario de GoHighLevel para importar citas al módulo de Closing."}
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
            onCalendarChanged={() => void loadStatus()}
          />
        ) : step === "credentials" ? (
          <StepCredentials onValidated={handleValidated} />
        ) : (
          <StepSelectCalendar
            apiKey={pendingApiKey}
            locationId={pendingLocationId}
            calendars={pendingCalendars}
            currentCalendarId={status?.defaultCalendarId ?? null}
            onConnected={handleConnected}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

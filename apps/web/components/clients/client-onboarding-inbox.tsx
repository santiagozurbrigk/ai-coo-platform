"use client";

/**
 * El link general del onboarding y su bandeja «sin asignar».
 *
 * ⭐ Es el pedido del audio: «si no está creado el cliente, que se cree con el
 * formulario… y después decir, bueno, esta ficha pertenece al cliente». El
 * link general lo puede completar cualquiera; lo que llega espera acá hasta
 * que alguien del equipo dice de qué cliente es (o crea uno nuevo con ese
 * envío). No crea clientes solo: un envío de prueba o repetido sería un
 * cliente fantasma en la cartera.
 *
 * Va arriba de la tabla de clientes, y sólo con el add-on `growth_partners`.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  cn,
} from "@ai-coo/ui";
import {
  ChevronDown,
  ClipboardCheck,
  Copy,
  Inbox,
  Link2,
  Loader2,
  Trash2,
  Unlink,
  UserPlus,
} from "lucide-react";
import {
  assignOnboardingSubmissionAction,
  createGeneralOnboardingLinkAction,
  discardOnboardingSubmissionAction,
  getGeneralOnboardingAction,
  revokeOnboardingLinkAction,
  type GeneralOnboarding,
} from "@/app/clients/onboarding-link-actions";
import { listFieldDefinitionsAction } from "@/app/clients/custom-field-actions";
import { listSubClientsAction } from "@/app/clients/sub-client-actions";
import { RespuestasDelEnvio } from "@/components/clients/sub-client-onboarding";
import { onboardingFormPath, type OnboardingSubmission } from "@/lib/client-onboarding/links";
import type { SubClient } from "@/lib/clients/sub-clients";
import { useToast } from "@/providers/toast-provider";
import type { Client } from "@/types/clients";
import type { FieldDefinition } from "@/types/custom-fields";

const CONTROL_CLASS =
  "h-9 w-full rounded-md border border-border bg-background px-2 text-sm";

/** Valor del selector para «crear uno nuevo». No choca con un uuid. */
const NUEVO = "__nuevo";

function fecha(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export function ClientOnboardingInbox({
  clients,
  onAssigned,
}: {
  clients: Client[];
  /** Se asignó un envío (y quizás se creó un cliente): recargar la lista. */
  onAssigned: () => void;
}) {
  const { push } = useToast();
  const [data, setData] = useState<GeneralOnboarding | null>(null);
  const [working, setWorking] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [bandeja, setBandeja] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setData(await getGeneralOnboardingAction());
    } catch {
      setData({ link: null, pending: [] });
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  if (data === null) return null;

  const url =
    data.link && typeof window !== "undefined"
      ? `${window.location.origin}${onboardingFormPath(data.link.token)}`
      : null;

  const generar = async () => {
    setWorking(true);
    const result = await createGeneralOnboardingLinkAction();
    setWorking(false);
    if (!result.success) {
      push({ title: "No se pudo generar el link", description: result.error });
      return;
    }
    setData((d) => ({ pending: d?.pending ?? [], link: result.data }));
  };

  const copiar = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      push({ title: "No se pudo copiar", description: url });
    }
  };

  const revocar = async () => {
    if (!data.link) return;
    if (
      !window.confirm(
        "¿Desactivar el link general? Quien lo tenga ya no va a poder abrirlo. Lo que llegó sigue en la bandeja."
      )
    ) {
      return;
    }
    setWorking(true);
    const result = await revokeOnboardingLinkAction(data.link.id);
    setWorking(false);
    if (!result.success) {
      push({ title: "No se pudo desactivar", description: result.error });
      return;
    }
    setData((d) => ({ pending: d?.pending ?? [], link: null }));
  };

  const quitar = (id: string) =>
    setData((d) => (d ? { ...d, pending: d.pending.filter((e) => e.id !== id) } : d));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm">
      <div className="min-w-0">
        <p className="font-medium">Onboarding para clientes nuevos</p>
        <p className="text-xs text-muted-foreground">
          Un link para quien todavía no está cargado. Lo que responda queda acá
          hasta que digas de qué cliente es.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {data.pending.length > 0 ? (
          <Button size="sm" className="gap-1.5" onClick={() => setBandeja(true)}>
            <Inbox className="h-4 w-4" />
            {data.pending.length === 1 ? "1 sin asignar" : `${data.pending.length} sin asignar`}
          </Button>
        ) : null}

        {data.link ? (
          <>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={copiar}>
              {copiado ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copiado ? "Copiado" : "Copiar link"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0"
              title="Desactivar el link general"
              onClick={revocar}
              disabled={working}
            >
              <Unlink className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={generar} disabled={working}>
            {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
            Generar link general
          </Button>
        )}
      </div>

      {bandeja ? (
        <Bandeja
          pending={data.pending}
          clients={clients}
          onClose={() => setBandeja(false)}
          onResolved={(id, asignado) => {
            quitar(id);
            if (asignado) onAssigned();
          }}
        />
      ) : null}
    </div>
  );
}

function Bandeja({
  pending,
  clients,
  onClose,
  onResolved,
}: {
  pending: OnboardingSubmission[];
  clients: Client[];
  onClose: () => void;
  onResolved: (id: string, asignado: boolean) => void;
}) {
  const [fields, setFields] = useState<FieldDefinition[]>([]);

  // Sólo para mostrar las respuestas con la etiqueta de cada opción.
  useEffect(() => {
    listFieldDefinitionsAction("client").then(setFields).catch(() => setFields([]));
  }, []);

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Onboardings sin asignar</DialogTitle>
          <DialogDescription>
            Llegaron por el link general. Asignalos a un cliente para que las
            respuestas caigan en la ficha de su creador.
          </DialogDescription>
        </DialogHeader>

        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No queda nada por asignar.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((envio) => (
              <EnvioSinAsignar
                key={envio.id}
                envio={envio}
                clients={clients}
                fields={fields}
                onResolved={(asignado) => onResolved(envio.id, asignado)}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function EnvioSinAsignar({
  envio,
  clients,
  fields,
  onResolved,
}: {
  envio: OnboardingSubmission;
  clients: Client[];
  fields: FieldDefinition[];
  onResolved: (asignado: boolean) => void;
}) {
  const { push } = useToast();
  const [verRespuestas, setVerRespuestas] = useState(false);
  const [clientId, setClientId] = useState<string>("");
  const [newClientName, setNewClientName] = useState(envio.respondentName ?? "");
  const [creadores, setCreadores] = useState<SubClient[] | null>(null);
  const [subClientId, setSubClientId] = useState<string>(NUEVO);
  const [newSubName, setNewSubName] = useState(envio.creatorName ?? "");
  const [saving, setSaving] = useState(false);

  const ordenados = [...clients].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const esNuevo = clientId === NUEVO;

  // Los creadores del growth partner elegido, para poder sumar el envío a uno
  // que ya existe en vez de duplicarlo.
  useEffect(() => {
    setCreadores(null);
    setSubClientId(NUEVO);
    if (!clientId || clientId === NUEVO) return;
    let vivo = true;
    listSubClientsAction(clientId)
      .then((lista) => {
        if (!vivo) return;
        setCreadores(lista);
        const mismo = lista.find(
          (s) => s.name.trim().toLowerCase() === (envio.creatorName ?? "").trim().toLowerCase()
        );
        if (mismo) setSubClientId(mismo.id);
      })
      .catch(() => vivo && setCreadores([]));
    return () => {
      vivo = false;
    };
  }, [clientId, envio.creatorName]);

  const puedeAsignar =
    (esNuevo ? newClientName.trim() !== "" : clientId !== "") &&
    (subClientId !== NUEVO || newSubName.trim() !== "");

  const asignar = async () => {
    setSaving(true);
    const result = await assignOnboardingSubmissionAction({
      submissionId: envio.id,
      clientId: esNuevo ? null : clientId,
      newClientName: esNuevo ? newClientName : null,
      subClientId: subClientId === NUEVO ? null : subClientId,
      newSubClientName: subClientId === NUEVO ? newSubName : null,
    });
    setSaving(false);
    if (!result.success) {
      push({ title: "No se pudo asignar", description: result.error });
      return;
    }
    push({ title: "Onboarding asignado", variant: "success" });
    onResolved(true);
  };

  const descartar = async () => {
    if (!window.confirm("¿Descartar este envío? Sale de la bandeja y no se asigna a nadie.")) {
      return;
    }
    setSaving(true);
    const result = await discardOnboardingSubmissionAction(envio.id);
    setSaving(false);
    if (!result.success) {
      push({ title: "No se pudo descartar", description: result.error });
      return;
    }
    onResolved(false);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border/60 p-3 dark:border-white/[0.08]">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium">{envio.creatorName ?? "Sin nombre de creador"}</p>
          <p className="text-xs text-muted-foreground">
            Lo completó {envio.respondentName ?? "alguien"} el {fecha(envio.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => setVerRespuestas((v) => !v)}
          >
            Respuestas
            <ChevronDown className={cn("h-3 w-3 transition-transform", verRespuestas && "rotate-180")} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0"
            title="Descartar"
            onClick={descartar}
            disabled={saving}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {verRespuestas ? (
        <div className="max-h-72 overflow-y-auto rounded-md bg-muted/40 p-3 dark:bg-white/[0.03]">
          <RespuestasDelEnvio envio={envio} fields={fields} />
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          <Label className="text-xs">Cliente (growth partner)</Label>
          <select
            className={CONTROL_CLASS}
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
          >
            <option value="">Elegí un cliente…</option>
            <option value={NUEVO}>+ Cliente nuevo</option>
            {ordenados.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {esNuevo ? (
            <Input
              value={newClientName}
              maxLength={200}
              placeholder="Nombre del cliente nuevo"
              onChange={(event) => setNewClientName(event.target.value)}
            />
          ) : null}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Creador</Label>
          <select
            className={CONTROL_CLASS}
            value={subClientId}
            disabled={clientId === "" || (!esNuevo && creadores === null)}
            onChange={(event) => setSubClientId(event.target.value)}
          >
            <option value={NUEVO}>+ Creador nuevo</option>
            {(creadores ?? []).map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          {subClientId === NUEVO ? (
            <Input
              value={newSubName}
              maxLength={200}
              placeholder="Nombre del creador"
              onChange={(event) => setNewSubName(event.target.value)}
            />
          ) : null}
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" className="gap-1.5" onClick={asignar} disabled={!puedeAsignar || saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Asignar
        </Button>
      </div>
    </div>
  );
}

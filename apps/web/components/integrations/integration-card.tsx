"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { useToast } from "@/providers/toast-provider";
import { useMarketingData } from "@/providers";
import type { Integration } from "@/types/integrations";

const STATUS_LABEL: Record<string, string> = {
  connected: es.status.integration.connected,
  not_connected: es.status.integration.not_connected,
  syncing: es.status.integration.syncing,
};

export function IntegrationCard({ integration }: { integration: Integration }) {
  const [status, setStatus] = useState(integration.status);
  const [connectOpen, setConnectOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { push } = useToast();
  const { setInstagramConnected } = useMarketingData();

  const statusVariant =
    status === "connected"
      ? "success"
      : status === "syncing"
        ? "warning"
        : "secondary";

  const handleConnect = () => {
    if (integration.provider === "calendly") {
      // Inicia el OAuth real redirigiendo al backend.
      window.location.href = "/api/integrations/calendly/oauth/start";
      return;
    }

    setConnectOpen(false);
    setSyncing(true);
    setStatus("syncing");
    push({ title: es.flow.integrationConnected, description: es.common.loading });
    window.setTimeout(() => {
      setSyncing(false);
      setStatus("connected");
      if (integration.provider === "instagram") {
        setInstagramConnected(true);
      }
      push({
        title: es.flow.integrationConnected,
        description: es.flow.integrationConnectedDesc,
        variant: "success",
      });
    }, 1200);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{integration.name}</CardTitle>
            <Badge variant={statusVariant}>{STATUS_LABEL[status]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {integration.provider === "instagram" && (
            <p className="text-xs text-muted-foreground">
              Conectá tu Instagram para visualizar el rendimiento de tu contenido y su
              impacto en conversaciones, agendamientos y ventas.
            </p>
          )}
          {integration.provider === "calendly" && (
            <p className="text-xs text-muted-foreground">
              Sincroniza llamadas de cierre con Closing, importa respuestas del
              formulario previo y registra resultados de cada llamada.
            </p>
          )}
          {integration.provider === "miro" && (
            <p className="text-xs text-muted-foreground">
              Importa tableros con vista previa para la base de conocimiento.
            </p>
          )}
          {integration.lastSync && status === "connected" && (
            <p className="text-xs text-muted-foreground">
              Última sync: {integration.lastSync}
              {integration.recordsSynced != null &&
                ` · ${integration.recordsSynced.toLocaleString("es")} registros`}
            </p>
          )}
          {syncing && (
            <p className="text-xs text-warning">Sincronizando datos…</p>
          )}
          <Button
            variant={status === "not_connected" ? "default" : "outline"}
            size="sm"
            className="w-full"
            type="button"
            disabled={syncing}
            onClick={() => {
              if (integration.provider === "calendly" && status === "not_connected") {
                window.location.href = "/api/integrations/calendly/oauth/start";
                return;
              }

              status === "not_connected"
                ? setConnectOpen(true)
                : push({
                    title: integration.name,
                    description: "Configuración de integración — prototipo.",
                  });
            }}
          >
            {syncing
              ? es.status.integration.syncing
              : status === "not_connected"
                ? es.common.connect
                : es.common.manage}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {integration.name}</DialogTitle>
            <DialogDescription>
              Flujo simulado — en producción se abrirá OAuth o API key.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            La IA indexará conversaciones, transcripciones y documentos para el
            Contexto de negocio y los reportes ejecutivos.
          </p>
          <DialogFooter>
            <Button variant="ghost" type="button" onClick={() => setConnectOpen(false)}>
              {es.common.cancel}
            </Button>
            <Button type="button" onClick={handleConnect}>
              {es.common.connect}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

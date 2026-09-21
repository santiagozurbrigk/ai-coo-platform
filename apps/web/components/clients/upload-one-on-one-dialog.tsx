"use client";

/**
 * Subir la 1-1 de un cliente pegando el link compartido de Fathom.
 *
 * ⭐ Un solo campo. La fecha, la duración y el título salen de la propia
 * grabación: pedírselos al usuario sería hacerle tipear datos que el link ya
 * trae, y cada uno tipeado a mano es uno que puede quedar mal.
 */

import { useState } from "react";
import {
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
import { AlertTriangle, Loader2 } from "lucide-react";
import { uploadOneOnOneFromShareLinkAction } from "@/app/fathom/manual-upload-actions";
import { useToast } from "@/providers/toast-provider";

export function UploadOneOnOneDialog({
  clientId,
  open,
  onClose,
  onUploaded,
}: {
  clientId: string;
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const { push } = useToast();
  const [shareUrl, setShareUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    if (saving) return;
    setShareUrl("");
    setError(null);
    onClose();
  };

  const subir = async () => {
    setSaving(true);
    setError(null);

    const result = await uploadOneOnOneFromShareLinkAction({ clientId, shareUrl });

    setSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    const { tasksCreated, hasTranscript, alreadyExisted } = result.data;

    /**
     * ⭐ El aviso dice lo que pasó de verdad, incluidos los casos flojos. Una
     * llamada sin transcript se guardó igual —cuenta para el contador— pero no
     * va a tener tareas automáticas, y quien la subió tiene que enterarse ahí
     * mismo, no cuando abra la lista y la encuentre vacía.
     */
    const detalle = alreadyExisted
      ? "Ya estaba cargada para este cliente, así que no se duplicó nada."
      : !hasTranscript
        ? "Fathom todavía no tiene lista la transcripción, así que no se extrajeron tareas. Podés cargarlas a mano."
        : tasksCreated > 0
          ? `Se cargaron ${tasksCreated} tarea${tasksCreated === 1 ? "" : "s"} de la llamada.`
          : "No quedaron compromisos concretos en la llamada.";

    push({
      title: alreadyExisted ? "Esa llamada ya estaba" : "Llamada 1-1 agregada",
      description: detalle,
      variant: "success",
    });

    setShareUrl("");
    onUploaded();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : cerrar())}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subir una sesión 1-1</DialogTitle>
          <DialogDescription>
            Pegá el link de Fathom de la llamada. Se trae sola la fecha, la
            duración y la transcripción, y se cargan las tareas que quedaron.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="fathom-share-url">Link de la grabación</Label>
          <Input
            id="fathom-share-url"
            value={shareUrl}
            onChange={(event) => setShareUrl(event.target.value)}
            placeholder="https://fathom.video/share/..."
            autoComplete="off"
            disabled={saving}
            onKeyDown={(event) => {
              if (event.key === "Enter" && shareUrl.trim() && !saving) subir();
            }}
          />
          <p className="text-xs text-muted-foreground">
            Es el que sale del botón «Share» en Fathom. Sirve el de cualquier
            cuenta, no hace falta que la grabación sea tuya.
          </p>
        </div>

        {error ? (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs text-destructive">{error}</p>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={cerrar} disabled={saving}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={subir}
            disabled={saving || !shareUrl.trim()}
            className="gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {saving ? "Trayendo la llamada…" : "Subir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

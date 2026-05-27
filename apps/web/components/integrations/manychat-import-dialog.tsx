"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { importManyChatSubscriberAction } from "@/app/manychat/actions";
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
import { es } from "@/lib/locale/es";
import { usePlatformData } from "@/providers";
import { useToast } from "@/providers/toast-provider";

type ManyChatImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManyChatImportDialog({
  open,
  onOpenChange,
}: ManyChatImportDialogProps) {
  const router = useRouter();
  const { push } = useToast();
  const { refreshConversations } = usePlatformData();
  const [subscriberId, setSubscriberId] = useState("");
  const [pending, setPending] = useState(false);

  async function handleImport() {
    setPending(true);
    try {
      const result = await importManyChatSubscriberAction(subscriberId);
      if (!result.ok) {
        push({
          title: "No se pudo importar",
          description: result.error ?? "Error desconocido",
        });
        return;
      }
      await refreshConversations();
      router.refresh();
      push({
        title: "Contacto importado",
        description: "Revisa la bandeja en Ventas → Inbox.",
        variant: "success",
      });
      onOpenChange(false);
      setSubscriberId("");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar contacto de ManyChat</DialogTitle>
          <DialogDescription>
            Pega el subscriber ID del contacto. Lo encuentras en el perfil del contacto
            en ManyChat o en el payload del External Request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="import-subscriber-id">Subscriber ID</Label>
          <Input
            id="import-subscriber-id"
            value={subscriberId}
            onChange={(e) => setSubscriberId(e.target.value)}
            placeholder="Ej: 123456789012345"
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {es.common.cancel}
          </Button>
          <Button type="button" disabled={pending} onClick={handleImport}>
            {pending ? "Importando…" : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

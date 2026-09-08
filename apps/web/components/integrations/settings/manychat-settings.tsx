"use client";

import { useState } from "react";
import { Button } from "@ai-coo/ui";
import { ManyChatWebhookNotice } from "../manychat-webhook-notice";
import { ManyChatCtaPanel } from "../manychat-cta-panel";
import { ManyChatImportDialog } from "../manychat-import-dialog";

/**
 * Configuración de ManyChat: la URL del External Request y las etiquetas de CTA.
 *
 * Antes esto vivía en un cajón lateral propio (`manychat-manage-sheet.tsx`) que
 * se abría desde la tarjeta. El cajón se eliminó por dos motivos:
 *
 * 1. **Era el único proveedor con esa forma.** Todos los demás configuran en el
 *    panel de detalle; ManyChat abría un cajón encima.
 * 2. **Estaba siempre montado y asomaba en pantalla.** Era un `position: fixed`
 *    renderizado dentro del contenido de la página, y el wrapper de transición
 *    de ruta le rompía el posicionamiento (ver `page-transition.tsx`): en vez de
 *    quedar fuera del viewport cuando estaba cerrado, se corría 32 px hacia
 *    adentro y aparecía como una franja en el borde derecho que no se podía ver
 *    ni alcanzar con scroll.
 */
export function ManyChatSettings({
  webhookUrl,
}: {
  webhookUrl: string | null;
}) {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="space-y-5">
      {webhookUrl ? (
        <ManyChatWebhookNotice webhookUrl={webhookUrl} />
      ) : (
        <p className="text-xs text-muted-foreground">
          La URL del webhook aparece acá en cuanto ManyChat esté conectado.
        </p>
      )}

      <ManyChatCtaPanel />

      <div className="border-t border-border/40 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setImportOpen(true)}
        >
          Importar contacto
        </Button>
      </div>

      <ManyChatImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}

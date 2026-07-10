"use client";

import { X } from "lucide-react";
import { Button, cn } from "@ai-coo/ui";
import { ManyChatWebhookNotice } from "./manychat-webhook-notice";
import { ManyChatCtaPanel } from "./manychat-cta-panel";

export function ManyChatManageSheet({
  open,
  onOpenChange,
  webhookUrl,
  onImportContact,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  webhookUrl: string | null;
  onImportContact: () => void;
}) {
  return (
    <>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-black/50"
          aria-label="Cerrar panel de ManyChat"
          onClick={() => onOpenChange(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border/40 bg-background p-6 shadow-xl backdrop-blur-xl transition-transform duration-200 dark:border-glass dark:bg-[#111111]/80",
          open ? "translate-x-0" : "translate-x-full"
        )}
        aria-hidden={!open}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-medium text-foreground">ManyChat</h2>
            <p className="text-xs text-muted-foreground">
              Webhook y configuración de External Request
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {webhookUrl ? (
            <ManyChatWebhookNotice webhookUrl={webhookUrl} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Cargando URL del webhook…
            </p>
          )}

          <ManyChatCtaPanel />
        </div>

        <div className="mt-6 border-t border-border/40 pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onImportContact}
          >
            Importar contacto
          </Button>
        </div>
      </aside>
    </>
  );
}

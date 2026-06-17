"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ai-coo/ui";
import { formatTempCredentialsCopyBlock } from "@/lib/auth/temp-credentials";

export type TempCredentialsDialogProps = {
  open: boolean;
  onClose: () => void;
  email: string;
  tempPassword: string;
};

export function TempCredentialsDialog({
  open,
  onClose,
  email,
  tempPassword,
}: TempCredentialsDialogProps) {
  const [copiedField, setCopiedField] = useState<
    "email" | "password" | "all" | null
  >(null);

  async function copyText(
    text: string,
    field: "email" | "password" | "all"
  ) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Usuario creado ✓</DialogTitle>
          <DialogDescription>
            Compartí estas credenciales con el usuario. Va a tener que cambiar
            la contraseña en su primer ingreso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="truncate font-medium">{email}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copyText(email, "email")}
            >
              {copiedField === "email" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Contraseña temporal
              </p>
              <p className="font-mono font-medium">{tempPassword}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => copyText(tempPassword, "password")}
            >
              {copiedField === "password" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() =>
              copyText(
                formatTempCredentialsCopyBlock({ email, tempPassword }),
                "all"
              )
            }
          >
            {copiedField === "all" ? "Copiado ✓" : "Copiar todo"}
          </Button>
          <Button type="button" className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

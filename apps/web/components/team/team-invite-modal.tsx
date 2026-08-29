"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormField,
  Input,
} from "@ai-coo/ui";
import { inviteTeamMemberAction } from "@/app/team/actions";
import { TempCredentialsDialog } from "@/components/shared/temp-credentials-dialog";
import type { TempCredentials } from "@/lib/auth/temp-credentials";
import type { CustomRole } from "@/types/team";

const selectClass =
  "flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm dark:border-white/[0.08] dark:bg-[#1A1A1A]";

export function TeamInviteModal({
  roles,
  onInvited,
}: {
  roles: CustomRole[];
  onInvited: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [customRoleId, setCustomRoleId] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tempCredentials, setTempCredentials] = useState<TempCredentials | null>(
    null
  );

  const assignableRoles = roles.filter((r) => !r.isDefault);

  const handleInvite = () => {
    if (!customRoleId) {
      setError("Seleccioná un rol");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await inviteTeamMemberAction({
        email,
        fullName,
        customRoleId,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setOpen(false);
      setEmail("");
      setFullName("");
      setCustomRoleId("");
      setTempCredentials(result.data.tempCredentials);
      onInvited();
    });
  };

  const canSubmit =
    email.trim().includes("@") &&
    fullName.trim() &&
    Boolean(customRoleId) &&
    assignableRoles.length > 0;

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="bg-brand-600 hover:bg-brand-700"
        onClick={() => setOpen(true)}
      >
        Invitar miembro
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invitar miembro</DialogTitle>
            <DialogDescription>
              Se crea el usuario con contraseña temporal. Compartí las
              credenciales manualmente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormField label="Nombre" required>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nombre del miembro"
                disabled={pending}
              />
            </FormField>

            <FormField label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="persona@empresa.com"
                disabled={pending}
              />
            </FormField>

            <FormField label="Rol" required>
              {assignableRoles.length > 0 ? (
                <select
                  className={selectClass}
                  value={customRoleId}
                  onChange={(e) => setCustomRoleId(e.target.value)}
                  disabled={pending}
                  required
                >
                  <option value="">Seleccioná un rol</option>
                  {assignableRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No hay roles creados. Creá un rol en la pestaña Roles primero.
                </p>
              )}
            </FormField>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              disabled={pending || !canSubmit}
              onClick={handleInvite}
            >
              {pending ? "Creando…" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {tempCredentials && (
        <TempCredentialsDialog
          open
          onClose={() => setTempCredentials(null)}
          email={tempCredentials.email}
          tempPassword={tempCredentials.tempPassword}
        />
      )}
    </>
  );
}

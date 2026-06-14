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
import { USER_ROLES } from "@/constants/roles";
import { useToast } from "@/providers/toast-provider";
import type { CustomRole } from "@/types/team";
import type { UserRole } from "@ai-coo/types";

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
  const [role, setRole] = useState<UserRole>("viewer");
  const [customRoleId, setCustomRoleId] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { push } = useToast();

  const handleInvite = () => {
    setError(null);
    startTransition(async () => {
      const result = await inviteTeamMemberAction({
        email,
        role,
        customRoleId: customRoleId || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      push({
        title: "Invitación enviada",
        description: `Se envió la invitación a ${email.trim()}`,
        variant: "success",
      });
      setOpen(false);
      setEmail("");
      setCustomRoleId("");
      onInvited();
    });
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        className="bg-violet-600 hover:bg-violet-700"
        onClick={() => setOpen(true)}
      >
        Invitar miembro
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invitar miembro</DialogTitle>
            <DialogDescription>
              Enviá una invitación por email. El link expira en 7 días.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormField label="Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="persona@empresa.com"
                disabled={pending}
              />
            </FormField>

            <FormField label="Rol del sistema" required>
              <select
                className={selectClass}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={pending}
              >
                {USER_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </FormField>

            {roles.length > 0 ? (
              <FormField label="Rol personalizado (opcional)">
                <select
                  className={selectClass}
                  value={customRoleId}
                  onChange={(e) => setCustomRoleId(e.target.value)}
                  disabled={pending}
                >
                  <option value="">Ninguno</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              disabled={pending || !email.trim().includes("@")}
              onClick={handleInvite}
            >
              {pending ? "Enviando…" : "Enviar invitación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

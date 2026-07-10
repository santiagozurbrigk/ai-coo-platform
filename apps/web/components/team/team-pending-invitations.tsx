"use client";

import { useTransition } from "react";
import { Button, DataTable } from "@ai-coo/ui";
import { revokeInvitationAction } from "@/app/team/actions";
import { formatRelativeTime } from "@/lib/format";
import type { TeamInvitation } from "@/types/team";

export function TeamPendingInvitations({
  invitations,
  onUpdated,
}: {
  invitations: TeamInvitation[];
  onUpdated: () => void;
}) {
  const [pending, startTransition] = useTransition();

  if (invitations.length === 0) return null;

  return (
    <DataTable
      title="Invitaciones pendientes"
      columns={[
        { key: "email", header: "Email", cell: (r) => r.email },
        {
          key: "role",
          header: "Rol",
          cell: (r) => (
            <span className="text-sm">
              {r.customRoleName ?? "Sin rol asignado"}
            </span>
          ),
        },
        {
          key: "invitedBy",
          header: "Enviada por",
          cell: (r) => r.invitedByName ?? "—",
        },
        {
          key: "expires",
          header: "Vence",
          cell: (r) => formatRelativeTime(r.expiresAt),
        },
        {
          key: "actions",
          header: "",
          cell: (r) => (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await revokeInvitationAction(r.id);
                  onUpdated();
                })
              }
            >
              Revocar
            </Button>
          ),
        },
      ]}
      data={invitations}
      keyExtractor={(r) => r.id}
    />
  );
}

"use client";

import { useTransition } from "react";
import { Badge, Button, DataTable } from "@ai-coo/ui";
import { revokeInvitationAction } from "@/app/team/actions";
import { USER_ROLES } from "@/constants/roles";
import { formatRelativeTime } from "@/lib/format";
import type { TeamInvitation } from "@/types/team";

function roleLabel(role: string) {
  return USER_ROLES.find((r) => r.value === role)?.label ?? role;
}

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
            <div className="flex flex-col gap-0.5">
              <span>{roleLabel(r.role)}</span>
              {r.customRoleName ? (
                <Badge variant="outline" className="w-fit text-[10px]">
                  {r.customRoleName}
                </Badge>
              ) : null}
            </div>
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

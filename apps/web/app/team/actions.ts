"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import {
  permissionsToRow,
  rowToCustomRole,
  rowToTeamInvitation,
  rowToTeamMember,
  type ProfileRow,
  type TeamInvitationRow,
  type TeamRoleRow,
} from "@/lib/team/mapper";
import {
  actionErrorMessage,
  runMutation,
  type MutationResult,
} from "@/lib/server/action-result";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { paths } from "@/routes/paths";
import type { CustomRole, PermissionLevel, TeamInvitation, TeamMember } from "@/types/team";
import type { UserRole } from "@ai-coo/types";

function revalidateTeam() {
  revalidatePath(paths.platform.team.root);
}

function canManageTeam(role: string | undefined): boolean {
  return Boolean(role && ["founder", "admin"].includes(role));
}

async function requireManagerProfile() {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error("Sesión no válida");
  if (!canManageTeam(profile.role)) {
    throw new Error("Sin permisos para esta acción");
  }
  return profile;
}

export async function getTeamMembersAction(): Promise<TeamMember[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      email,
      role,
      avatar_url,
      is_active,
      last_login_at,
      hourly_rate,
      hourly_rate_currency,
      custom_role_id,
      created_at,
      team_roles(name, permissions)
    `
    )
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as ProfileRow[]).map(rowToTeamMember);
}

export async function getTeamRolesAction(): Promise<CustomRole[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_roles")
    .select("*")
    .eq("organization_id", organizationId)
    .order("is_default", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  if (!data?.length) {
    const { error: rpcError } = await supabase.rpc("create_default_roles", {
      org_id: organizationId,
    });
    if (rpcError && !isMissingTableError(rpcError.message)) {
      throw new Error(rpcError.message);
    }

    const { data: seeded, error: retryError } = await supabase
      .from("team_roles")
      .select("*")
      .eq("organization_id", organizationId)
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });

    if (retryError) throw new Error(retryError.message);
    return ((seeded ?? []) as TeamRoleRow[]).map(rowToCustomRole);
  }

  return (data as TeamRoleRow[]).map(rowToCustomRole);
}

export async function getPendingInvitationsAction(): Promise<TeamInvitation[]> {
  if (!isSupabaseConfigured()) return [];

  const organizationId = await requireOrganizationId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_invitations")
    .select(
      `
      id,
      email,
      role,
      status,
      expires_at,
      created_at,
      custom_role_id,
      invited_by,
      profiles(full_name),
      team_roles(name)
    `
    )
    .eq("organization_id", organizationId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    if (isMissingTableError(error.message)) return [];
    throw new Error(error.message);
  }

  return ((data ?? []) as unknown as TeamInvitationRow[]).map(
    rowToTeamInvitation
  );
}

export async function getTeamPageContextAction(): Promise<{
  members: TeamMember[];
  roles: CustomRole[];
  invitations: TeamInvitation[];
  canManage: boolean;
  canEditRates: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      members: [],
      roles: [],
      invitations: [],
      canManage: false,
      canEditRates: false,
    };
  }

  const profile = await getCurrentProfile();
  const [members, roles, invitations] = await Promise.all([
    getTeamMembersAction(),
    getTeamRolesAction(),
    getPendingInvitationsAction(),
  ]);

  return {
    members,
    roles,
    invitations,
    canManage: canManageTeam(profile?.role),
    canEditRates: canManageTeam(profile?.role),
  };
}

export async function inviteTeamMemberAction(data: {
  email: string;
  role: UserRole;
  customRoleId?: string;
}): Promise<MutationResult<{ inviteUrl: string }>> {
  return runMutation(async () => {
    const profile = await requireManagerProfile();
    const organizationId = profile.organization_id;
    const supabase = await createClient();

    const email = data.email.trim().toLowerCase();
    if (!email.includes("@")) throw new Error("Email inválido");

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      throw new Error("Este email ya es miembro de la organización");
    }

    const { data: invitation, error } = await supabase
      .from("team_invitations")
      .upsert(
        {
          organization_id: organizationId,
          email,
          role: data.role,
          custom_role_id: data.customRoleId ?? null,
          invited_by: profile.id,
          status: "pending",
          expires_at: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        { onConflict: "organization_id,email" }
      )
      .select("token")
      .single();

    if (error) throw new Error(error.message);

    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", organizationId)
      .maybeSingle();

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
      "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite?token=${invitation.token}`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ?? "noreply@optimizatucontrol.com",
        to: email,
        subject: `Te invitaron a unirte a ${org?.name ?? "OTC"} en Optimiza Tu Control`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2>Fuiste invitado a ${org?.name ?? "un equipo"}</h2>
            <p>${profile.full_name ?? "Un miembro del equipo"} te invitó a unirte
               como <strong>${data.role}</strong> en Optimiza Tu Control.</p>
            <p>
              <a href="${inviteUrl}"
                 style="background:#7C3AED;color:white;padding:12px 24px;
                        border-radius:8px;text-decoration:none;display:inline-block;">
                Aceptar invitación
              </a>
            </p>
            <p style="color:#666;font-size:12px;">
              Este link expira en 7 días.
            </p>
          </div>
        `,
      });
    }

    revalidateTeam();
    return { inviteUrl };
  });
}

export async function updateMemberRoleAction(
  memberId: string,
  data: {
    role?: UserRole;
    customRoleId?: string | null;
    isActive?: boolean;
  }
): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const profile = await requireManagerProfile();
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        role: data.role,
        custom_role_id: data.customRoleId,
        is_active: data.isActive,
      })
      .eq("id", memberId)
      .eq("organization_id", profile.organization_id);

    if (error) throw new Error(error.message);

    revalidateTeam();
    return { ok: true };
  });
}

export async function deactivateMemberAction(
  memberId: string
): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const profile = await requireManagerProfile();
    if (memberId === profile.id) {
      throw new Error("No podés desactivarte a vos mismo");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", memberId)
      .eq("organization_id", profile.organization_id);

    if (error) throw new Error(error.message);

    revalidateTeam();
    return { ok: true };
  });
}

export async function createCustomRoleAction(data: {
  name: string;
  description?: string;
  permissions: Record<string, PermissionLevel>;
}): Promise<MutationResult<CustomRole>> {
  return runMutation(async () => {
    const profile = await requireManagerProfile();
    const supabase = await createClient();

    const { data: role, error } = await supabase
      .from("team_roles")
      .insert({
        organization_id: profile.organization_id,
        name: data.name.trim(),
        description: data.description?.trim() || null,
        permissions: permissionsToRow(data.permissions),
        is_default: false,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    revalidateTeam();
    return rowToCustomRole(role as TeamRoleRow);
  });
}

export async function deleteCustomRoleAction(
  roleId: string
): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const profile = await requireManagerProfile();
    const supabase = await createClient();

    const { data: role, error: fetchError } = await supabase
      .from("team_roles")
      .select("is_default")
      .eq("id", roleId)
      .eq("organization_id", profile.organization_id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!role) throw new Error("Rol no encontrado");
    if (role.is_default) throw new Error("No se pueden eliminar roles default");

    const { error } = await supabase
      .from("team_roles")
      .delete()
      .eq("id", roleId)
      .eq("organization_id", profile.organization_id);

    if (error) throw new Error(error.message);

    revalidateTeam();
    return { ok: true };
  });
}

export async function revokeInvitationAction(
  invitationId: string
): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    await requireManagerProfile();
    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { error } = await supabase
      .from("team_invitations")
      .update({ status: "expired" })
      .eq("id", invitationId)
      .eq("organization_id", organizationId);

    if (error) throw new Error(error.message);

    revalidateTeam();
    return { ok: true };
  });
}

export async function acceptInvitationAction(input: {
  token: string;
  fullName: string;
  password: string;
}): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const admin = createAdminClient();
    const token = input.token.trim();
    const fullName = input.fullName.trim();
    const password = input.password;

    if (!token) throw new Error("Token inválido");
    if (!fullName) throw new Error("Ingresá tu nombre completo");
    if (password.length < 8) throw new Error("La contraseña debe tener al menos 8 caracteres");

    const { data: invitation, error: inviteError } = await admin
      .from("team_invitations")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (inviteError) throw new Error(inviteError.message);
    if (!invitation) throw new Error("Invitación no encontrada");
    if (invitation.status !== "pending") {
      throw new Error("Esta invitación ya fue usada");
    }
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error("La invitación expiró");
    }

    const email = invitation.email.toLowerCase();

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createError) {
      if (
        createError.message.toLowerCase().includes("already") ||
        createError.message.toLowerCase().includes("registered")
      ) {
        throw new Error(
          "Ya tenés una cuenta con este email. Iniciá sesión para aceptar la invitación."
        );
      }
      throw new Error(createError.message);
    }

    if (!created.user) {
      throw new Error("No se pudo crear la cuenta");
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: created.user.id,
      organization_id: invitation.organization_id,
      email,
      full_name: fullName,
      role: invitation.role,
      custom_role_id: invitation.custom_role_id,
      invited_by: invitation.invited_by,
      is_active: true,
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id);
      throw new Error(profileError.message);
    }

    await admin
      .from("team_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    return { ok: true };
  });
}

export async function completeInvitationForCurrentUserAction(
  token: string
): Promise<MutationResult<{ ok: true }>> {
  return runMutation(async () => {
    const supabase = await createClient();
    const admin = createAdminClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) throw new Error("Iniciá sesión para continuar");

    const { data: invitation, error: inviteError } = await admin
      .from("team_invitations")
      .select("*")
      .eq("token", token.trim())
      .maybeSingle();

    if (inviteError) throw new Error(inviteError.message);
    if (!invitation) throw new Error("Invitación no encontrada");
    if (invitation.status !== "pending") {
      throw new Error("Esta invitación ya fue usada");
    }
    if (new Date(invitation.expires_at) < new Date()) {
      throw new Error("La invitación expiró");
    }

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new Error("Esta invitación fue enviada a otro email");
    }

    const { data: existingProfile } = await admin
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile?.organization_id) {
      if (existingProfile.organization_id === invitation.organization_id) {
        await admin
          .from("team_invitations")
          .update({ status: "accepted" })
          .eq("id", invitation.id);
        return { ok: true };
      }
      throw new Error(
        "Tu cuenta ya pertenece a otra organización. Contactá al administrador."
      );
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: user.id,
      organization_id: invitation.organization_id,
      email: user.email,
      full_name:
        (user.user_metadata?.full_name as string | undefined) ??
        user.email.split("@")[0],
      role: invitation.role,
      custom_role_id: invitation.custom_role_id,
      invited_by: invitation.invited_by,
      is_active: true,
    });

    if (profileError) throw new Error(profileError.message);

    await admin
      .from("team_invitations")
      .update({ status: "accepted" })
      .eq("id", invitation.id);

    return { ok: true };
  });
}

export { actionErrorMessage };

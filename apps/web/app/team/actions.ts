"use server";

import { revalidatePath } from "next/cache";
import {
  getCurrentProfile,
  isMissingTableError,
  requireOrganizationId,
} from "@/lib/auth/bootstrap";
import { generateTempPassword } from "@/lib/auth/generate-temp-password";
import { tempPasswordProfileFields } from "@/lib/auth/temp-password-expiry";
import type { TempCredentials } from "@/lib/auth/temp-credentials";
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
import {
  acceptInvitationSchema,
  completeInvitationForCurrentUserSchema,
  createCustomRoleSchema,
  deactivateMemberSchema,
  deleteCustomRoleSchema,
  firstZodError,
  inviteTeamMemberSchema,
  revokeInvitationSchema,
  updateMemberRoleSchema,
} from "@/lib/validations";
import { paths } from "@/routes/paths";
import type { CustomRole, PermissionLevel, TeamInvitation, TeamMember } from "@/types/team";
import type { UserRole } from "@ai-coo/types";
import type { z } from "zod";

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

type ManagerProfileContext = Awaited<ReturnType<typeof requireManagerProfile>>;

async function requireManagerProfileAndParse<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown
): Promise<
  | { success: true; data: z.infer<T>; profile: ManagerProfileContext }
  | { success: false; error: string }
> {
  let profile: ManagerProfileContext;
  try {
    profile = await requireManagerProfile();
  } catch (error) {
    return { success: false, error: actionErrorMessage(error) };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed.error) };
  }

  return { success: true, data: parsed.data, profile };
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
  fullName: string;
  role: UserRole;
  customRoleId?: string;
}): Promise<MutationResult<{ tempCredentials: TempCredentials }>> {
  const auth = await requireManagerProfileAndParse(inviteTeamMemberSchema, data);
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { email, fullName, role, customRoleId } = auth.data;

  return runMutation(async () => {
    const profile = auth.profile;
    const organizationId = profile.organization_id;
    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      throw new Error("Este email ya es miembro de la organización");
    }

    const tempPassword = generateTempPassword();

    const { data: authUser, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });

    if (createError || !authUser.user) {
      if (
        createError?.message.toLowerCase().includes("already") ||
        createError?.message.toLowerCase().includes("registered")
      ) {
        throw new Error("Ya existe una cuenta con este email");
      }
      throw new Error(createError?.message ?? "Error creando usuario");
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: authUser.user.id,
      organization_id: organizationId,
      email,
      full_name: fullName,
      role,
      custom_role_id: customRoleId ?? null,
      invited_by: profile.id,
      is_active: true,
      ...tempPasswordProfileFields(),
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(authUser.user.id);
      throw new Error(profileError.message);
    }

    revalidateTeam();
    return { tempCredentials: { email, tempPassword } };
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
  const auth = await requireManagerProfileAndParse(updateMemberRoleSchema, {
    memberId,
    ...data,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { memberId: parsedMemberId, role, customRoleId, isActive } = auth.data;

  return runMutation(async () => {
    const profile = auth.profile;
    const supabase = await createClient();

    const { error } = await supabase
      .from("profiles")
      .update({
        role,
        custom_role_id: customRoleId,
        is_active: isActive,
      })
      .eq("id", parsedMemberId)
      .eq("organization_id", profile.organization_id);

    if (error) throw new Error(error.message);

    revalidateTeam();
    return { ok: true };
  });
}

export async function deactivateMemberAction(
  memberId: string
): Promise<MutationResult<{ ok: true }>> {
  const auth = await requireManagerProfileAndParse(deactivateMemberSchema, {
    memberId,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { memberId: parsedMemberId } = auth.data;

  return runMutation(async () => {
    const profile = auth.profile;
    if (parsedMemberId === profile.id) {
      throw new Error("No podés desactivarte a vos mismo");
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: false })
      .eq("id", parsedMemberId)
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
  const auth = await requireManagerProfileAndParse(createCustomRoleSchema, data);
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { name, description, permissions } = auth.data;

  return runMutation(async () => {
    const profile = auth.profile;
    const supabase = await createClient();

    const { data: role, error } = await supabase
      .from("team_roles")
      .insert({
        organization_id: profile.organization_id,
        name,
        description: description ?? null,
        permissions: permissionsToRow(permissions),
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
  const auth = await requireManagerProfileAndParse(deleteCustomRoleSchema, {
    roleId,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { roleId: parsedRoleId } = auth.data;

  return runMutation(async () => {
    const profile = auth.profile;
    const supabase = await createClient();

    const { data: role, error: fetchError } = await supabase
      .from("team_roles")
      .select("is_default")
      .eq("id", parsedRoleId)
      .eq("organization_id", profile.organization_id)
      .maybeSingle();

    if (fetchError) throw new Error(fetchError.message);
    if (!role) throw new Error("Rol no encontrado");
    if (role.is_default) throw new Error("No se pueden eliminar roles default");

    const { error } = await supabase
      .from("team_roles")
      .delete()
      .eq("id", parsedRoleId)
      .eq("organization_id", profile.organization_id);

    if (error) throw new Error(error.message);

    revalidateTeam();
    return { ok: true };
  });
}

export async function revokeInvitationAction(
  invitationId: string
): Promise<MutationResult<{ ok: true }>> {
  const auth = await requireManagerProfileAndParse(revokeInvitationSchema, {
    invitationId,
  });
  if (!auth.success) {
    return { success: false, error: auth.error };
  }

  const { invitationId: parsedInvitationId } = auth.data;

  return runMutation(async () => {
    const organizationId = auth.profile.organization_id;
    const supabase = await createClient();

    const { error } = await supabase
      .from("team_invitations")
      .update({ status: "expired" })
      .eq("id", parsedInvitationId)
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
  const parsed = acceptInvitationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed.error) };
  }

  const { token, fullName, password } = parsed.data;

  return runMutation(async () => {
    const admin = createAdminClient();

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
  const parsed = completeInvitationForCurrentUserSchema.safeParse({ token });
  if (!parsed.success) {
    return { success: false, error: firstZodError(parsed.error) };
  }

  const { token: parsedToken } = parsed.data;

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
      .eq("token", parsedToken)
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

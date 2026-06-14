import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token requerido" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: invitation, error } = await supabase
    .from("team_invitations")
    .select("id, email, role, status, expires_at, organization_id")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!invitation) {
    return NextResponse.json({ error: "Invitación no encontrada" }, { status: 404 });
  }

  if (invitation.status !== "pending") {
    return NextResponse.json(
      { error: "Esta invitación ya fue usada" },
      { status: 400 }
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return NextResponse.json({ error: "La invitación expiró" }, { status: 400 });
  }

  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", invitation.organization_id)
    .maybeSingle();

  const { data: inviter } = invitation.organization_id
    ? await supabase
        .from("team_invitations")
        .select("invited_by, profiles(full_name)")
        .eq("token", token)
        .maybeSingle()
    : { data: null };

  const profileRaw = inviter?.profiles as
    | { full_name: string | null }
    | { full_name: string | null }[]
    | null
    | undefined;
  const invitedByProfile = Array.isArray(profileRaw) ? profileRaw[0] : profileRaw;

  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    orgName: org?.name ?? "tu equipo",
    invitedBy: invitedByProfile?.full_name ?? null,
  });
}

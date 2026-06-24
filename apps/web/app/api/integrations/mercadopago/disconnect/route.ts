import { NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  try {
    const organizationId = await requireOrganizationId();
    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { error } = await admin
      .from("mercadopago_integrations")
      .update({
        status: "disconnected",
        updated_at: now,
      })
      .eq("organization_id", organizationId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo desconectar Mercado Pago",
      },
      { status: 500 }
    );
  }
}

/**
 * B · L0 — El webhook de Fathom, uno por miembro.
 *
 * ⭐ Reemplaza el escaneo que hace la ruta vieja: esa trae **todos** los
 * `fathom_integrations` de todas las organizaciones y prueba secreto por secreto
 * hasta que alguno valide. Con webhooks por miembro eso no escala, y además es un
 * patrón que cruza datos entre organizaciones sin necesidad.
 *
 * Acá el token de la URL identifica **una** integración, así que la firma se
 * verifica contra **un solo secreto**.
 */
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type IntegrationRow = {
  id: string;
  organization_id: string;
  user_id: string;
  webhook_secret: string | null;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const rawBody = await request.text();
  const admin = createAdminClient();

  const { data } = await admin
    .from("team_member_integrations")
    .select("id, organization_id, user_id, webhook_secret")
    .eq("webhook_token", token)
    .eq("integration_type", "fathom")
    .maybeSingle();

  const integration = data as IntegrationRow | null;

  // Un token que no existe no dice nada de por qué: no se filtra si el token es
  // inválido o si la integración se borró.
  if (!integration?.webhook_secret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!verifySignature(request, rawBody, integration.webhook_secret)) {
    // Una firma inválida en un token válido sí es raro: se registra en la fila
    // para que el panel lo muestre en vez de fallar en silencio.
    await admin
      .from("team_member_integrations")
      .update({
        last_error: "Llegó un webhook con firma inválida.",
        last_error_at: new Date().toISOString(),
      })
      .eq("id", integration.id);

    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const recordingId = readRecordingId(payload);
  if (!recordingId) {
    return NextResponse.json({ error: "Falta el id de la grabación" }, { status: 400 });
  }

  // El índice único (organization_id, fathom_call_id) es la red de contención
  // por si dos keys entregaran la misma llamada: la segunda no duplica.
  const { error } = await admin.from("fathom_calls").upsert(
    {
      organization_id: integration.organization_id,
      fathom_call_id: recordingId,
      // ⭐ Quién grabó. Es lo que hace posible la regla de privacidad: una
      // llamada sin vincular la ve sólo esta persona.
      user_id: integration.user_id,
      raw_payload: payload,
      status: "pending",
    },
    { onConflict: "organization_id,fathom_call_id" }
  );

  if (error) {
    console.error("[fathom webhook]", error.message);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }

  // ⭐ `last_event_at` es LA señal del panel: un miembro cuya key murió deja de
  // aportar llamadas y todo parece funcionar bien. Esto es lo que hace visible
  // ese silencio.
  await admin
    .from("team_member_integrations")
    .update({
      last_event_at: new Date().toISOString(),
      status: "connected",
      last_error: null,
      last_error_at: null,
    })
    .eq("id", integration.id);

  return NextResponse.json({ ok: true });
}

/** Verifica la firma contra el único secreto que corresponde a este token. */
function verifySignature(request: Request, rawBody: string, secret: string): boolean {
  const signature =
    request.headers.get("x-fathom-signature") ??
    request.headers.get("fathom-signature") ??
    request.headers.get("x-signature");

  if (!signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = signature.replace(/^sha256=/, "").trim();

  // Longitudes distintas hacen que timingSafeEqual lance en vez de devolver false.
  if (expected.length !== received.length) return false;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(received));
  } catch {
    return false;
  }
}

function readRecordingId(payload: Record<string, unknown>): string | null {
  for (const key of ["recording_id", "id", "meeting_id", "fathom_call_id"]) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }

  // Fathom puede anidar la grabación bajo `recording` o `meeting`.
  for (const key of ["recording", "meeting"]) {
    const nested = payload[key];
    if (typeof nested === "object" && nested !== null) {
      const id = (nested as Record<string, unknown>).id;
      if (typeof id === "string" && id.trim()) return id.trim();
      if (typeof id === "number") return String(id);
    }
  }

  return null;
}

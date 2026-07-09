import { NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { getUnipileConfig } from "@/lib/unipile/config";
import { ensureUnipileMessagingWebhook } from "@/lib/unipile/ensure-webhook";
import { createUnipileHostedAuthLink } from "@/lib/unipile/hosted-auth";
import { unipileConnectQuerySchema } from "@/lib/unipile/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = unipileConnectQuerySchema.safeParse({
    provider: searchParams.get("provider"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "provider inválido (instagram | whatsapp)" },
      { status: 400 }
    );
  }

  const { dsn, accessToken } = getUnipileConfig();
  if (!dsn || !accessToken) {
    return NextResponse.json(
      { error: "Unipile no configurado en el servidor" },
      { status: 500 }
    );
  }

  try {
    const organizationId = await requireOrganizationId();
    await ensureUnipileMessagingWebhook();
    const url = await createUnipileHostedAuthLink({
      organizationId,
      provider: parsed.data.provider,
    });

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo generar el enlace de Unipile",
      },
      { status: 500 }
    );
  }
}

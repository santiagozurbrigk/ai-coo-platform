import { NextResponse } from "next/server";
import { withOAuthNoCache } from "@/lib/integrations/oauth-callback-headers";
import { getUnipileConfig } from "@/lib/unipile/config";
import { processUnipileHostedAuthNotify } from "@/lib/unipile/process-hosted-auth";
import { verifyUnipileSecret } from "@/lib/unipile/incoming-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function verifyCallbackSecret(req: Request): boolean {
  const { webhookSecret } = getUnipileConfig();
  // Fail-closed y en tiempo constante: antes, sin secreto configurado, aceptaba todo.
  return verifyUnipileSecret(req, webhookSecret);
}

/** @deprecated Usar /api/integrations/unipile/webhook — se mantiene por compatibilidad. */
export async function POST(req: Request) {
  if (!verifyCallbackSecret(req)) {
    return withOAuthNoCache(
      NextResponse.json({ error: "No autorizado" }, { status: 401 })
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return withOAuthNoCache(
      NextResponse.json({ error: "JSON inválido" }, { status: 400 })
    );
  }

  try {
    const result = await processUnipileHostedAuthNotify(body);
    return withOAuthNoCache(NextResponse.json(result));
  } catch (err) {
    return withOAuthNoCache(
      NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Error al procesar callback de Unipile",
        },
        { status: 500 }
      )
    );
  }
}

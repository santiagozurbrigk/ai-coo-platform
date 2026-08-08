import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { connectFathomWithApiKey } from "@/lib/fathom/connect";
import {
  integrationConnectRateLimit,
  rateLimitErrorMessage,
} from "@/lib/rate-limit";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { apiKeySchema, firstZodError } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase no configurado." }, { status: 500 });
  }

  const auth = await requireAuth();
  if (!auth.ok) return auth.error;

  const { allowed, resetAt } = await integrationConnectRateLimit(auth.user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: rateLimitErrorMessage(resetAt) },
      { status: 429 }
    );
  }

  let body: { apiKey?: string };
  try {
    body = (await request.json()) as { apiKey?: string };
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = apiKeySchema.safeParse(body.apiKey);
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }

  const result = await connectFathomWithApiKey(auth.orgId, parsed.data);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    synced: result.synced ?? 0,
    warning: result.error,
  });
}

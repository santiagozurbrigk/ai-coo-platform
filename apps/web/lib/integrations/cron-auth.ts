import { NextResponse } from "next/server";

/** Valida Authorization: Bearer CRON_SECRET cuando está configurado. */
export function assertCronAuthorized(request: Request): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return null;
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

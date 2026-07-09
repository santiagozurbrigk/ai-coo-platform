import { NextResponse } from "next/server";
import { handleUnipileIncomingWebhook } from "@/lib/unipile/incoming-webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  return handleUnipileIncomingWebhook(req);
}

import { type NextRequest, NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth/require-auth";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    await requireAuthContext();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as { contentPieceId?: string };
    const { contentPieceId } = body;

    if (!contentPieceId) {
      return NextResponse.json(
        { error: "contentPieceId requerido" },
        { status: 400 }
      );
    }

    const { analyzeContentPieceAction } = await import(
      "@/app/marketing/content/actions"
    );
    const analysis = await analyzeContentPieceAction(contentPieceId);
    return NextResponse.json({ analysis });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[content/analyze]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

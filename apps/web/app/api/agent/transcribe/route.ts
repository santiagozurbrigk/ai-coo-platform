import { NextRequest, NextResponse } from "next/server";
import { requireAuthContext } from "@/lib/auth/require-auth";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    await requireAuthContext();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY no configurada" },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Cuerpo de la solicitud inválido" },
      { status: 400 }
    );
  }

  const audioFile = formData.get("audio");
  if (!audioFile || !(audioFile instanceof Blob)) {
    return NextResponse.json(
      { error: "Campo 'audio' requerido" },
      { status: 400 }
    );
  }

  if (audioFile.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { error: "El audio supera el límite de 25 MB" },
      { status: 413 }
    );
  }

  // Prepare multipart form for OpenAI Whisper
  const whisperForm = new FormData();
  const blobType = (audioFile as Blob).type ?? "";
  const filename =
    audioFile instanceof File
      ? audioFile.name
      : `recording.${blobType.includes("ogg") ? "ogg" : "webm"}`;
  whisperForm.append("file", audioFile, filename);
  whisperForm.append("model", "whisper-1");
  whisperForm.append("language", "es");

  const whisperRes = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: whisperForm,
    }
  );

  if (!whisperRes.ok) {
    const body = await whisperRes.text();
    console.error("[Transcribe] Whisper error", {
      status: whisperRes.status,
      body: body.slice(0, 300),
    });
    return NextResponse.json(
      { error: "Error al transcribir el audio" },
      { status: 502 }
    );
  }

  const data = (await whisperRes.json()) as { text?: string };
  return NextResponse.json({ text: data.text ?? "" });
}

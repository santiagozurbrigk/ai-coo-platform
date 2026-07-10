export async function transcribeAudioBuffer(audioBuffer: Buffer): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no configurada");
  }

  if (audioBuffer.byteLength > 25 * 1024 * 1024) {
    throw new Error("El audio supera el límite de 25 MB para Whisper");
  }

  const whisperForm = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/mpeg" });
  whisperForm.append("file", blob, "audio.mp3");
  whisperForm.append("model", "whisper-1");
  whisperForm.append("language", "es");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: whisperForm,
  });

  if (!whisperRes.ok) {
    const body = await whisperRes.text();
    console.error("[transcribe-whisper] Whisper error:", whisperRes.status, body.slice(0, 300));
    throw new Error("Error al transcribir el audio");
  }

  const data = (await whisperRes.json()) as { text?: string };
  return data.text?.trim() ?? "";
}

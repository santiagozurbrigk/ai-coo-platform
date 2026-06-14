import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

export function isOpenAIConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

function getEmbeddingClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new Error("OPENAI_API_KEY no configurada");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

export function formatVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getEmbeddingClient();

  const cleanText = text.replace(/\s+/g, " ").trim().slice(0, 8000);

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: cleanText,
    dimensions: 1536,
  });

  return response.data[0]?.embedding ?? [];
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = getEmbeddingClient();

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts.map((t) => t.replace(/\s+/g, " ").trim().slice(0, 8000)),
    dimensions: 1536,
  });

  return response.data.map((d) => d.embedding);
}

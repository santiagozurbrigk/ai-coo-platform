import { createHash, timingSafeEqual } from "crypto";

/**
 * Compara dos secretos en tiempo constante.
 *
 * Hashea antes de comparar para que `timingSafeEqual` reciba siempre buffers
 * del mismo largo: así tampoco se filtra el largo del secreto esperado.
 */
export function safeEqual(received: string | null | undefined, expected: string): boolean {
  if (typeof received !== "string" || !expected) return false;
  const a = createHash("sha256").update(received).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

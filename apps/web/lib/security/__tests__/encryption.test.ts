import { randomBytes } from "crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { encrypt, looksEncrypted, readStoredSecret } from "../encryption";

const ORIGINAL = process.env.ENCRYPTION_MASTER_KEY;

describe("readStoredSecret", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_MASTER_KEY = randomBytes(32).toString("base64");
  });
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.ENCRYPTION_MASTER_KEY;
    else process.env.ENCRYPTION_MASTER_KEY = ORIGINAL;
  });

  it("descifra lo que cifró encrypt()", () => {
    const stored = encrypt("sk_live_123");
    expect(looksEncrypted(stored)).toBe(true);
    expect(readStoredSecret(stored)).toBe("sk_live_123");
  });

  it("devuelve tal cual un valor legacy en texto plano, incluso con puntos", () => {
    expect(looksEncrypted("sk_live_123")).toBe(false);
    expect(readStoredSecret("sk_live_123")).toBe("sk_live_123");
    expect(readStoredSecret("eyJhbGciOi.eyJzdWIiOiIx.c2lnbmF0dXJl")).toBe(
      "eyJhbGciOi.eyJzdWIiOiIx.c2lnbmF0dXJl"
    );
  });

  it("tira si el ciphertext no descifra, en vez de mandarlo como API key", () => {
    const stored = encrypt("sk_live_123");
    process.env.ENCRYPTION_MASTER_KEY = randomBytes(32).toString("base64");
    expect(() => readStoredSecret(stored)).toThrow();
  });

  it("encrypt tira sin ENCRYPTION_MASTER_KEY", () => {
    delete process.env.ENCRYPTION_MASTER_KEY;
    expect(() => encrypt("x")).toThrow();
  });
});

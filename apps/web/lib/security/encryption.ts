import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getMasterKey(): Buffer {
  const key = process.env.ENCRYPTION_MASTER_KEY;
  if (!key) {
    throw new Error("ENCRYPTION_MASTER_KEY no está configurada");
  }
  return Buffer.from(key, "base64");
}

/**
 * Cifra un texto plano. Devuelve un string que incluye
 * iv + authTag + ciphertext, todo codificado, listo para guardar en DB.
 */
export function encrypt(plaintext: string): string {
  const key = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

/**
 * Descifra un string generado por encrypt(). Lanza error si
 * el formato es inválido o si la autenticación falla (tampering).
 */
export function decrypt(ciphertext: string): string {
  const key = getMasterKey();
  const parts = ciphertext.split(".");
  if (parts.length !== 3) {
    throw new Error("Formato de ciphertext inválido");
  }

  const [ivB64, authTagB64, encryptedB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Devuelve solo los últimos 4 caracteres de un secreto para
 * mostrar en UI sin exponer el valor completo, ej: "****a8f2"
 */
export function maskSecret(plaintext: string): string {
  if (plaintext.length <= 4) return "****";
  return `****${plaintext.slice(-4)}`;
}

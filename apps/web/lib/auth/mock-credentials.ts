/** Credenciales mock — solo Fase 0 (sin validación real). */

export const MOCK_CLIENT_CREDENTIALS = {
  email: "demo@client.com",
  password: "demo123",
} as const;

export const MOCK_SUPER_ADMIN_CREDENTIALS = {
  email: "admin@internal.ai",
  password: "admin123",
} as const;

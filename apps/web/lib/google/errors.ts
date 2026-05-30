export const GOOGLE_PERMISSION_RECONNECT_MESSAGE =
  "Reconectá tu cuenta de Google para actualizar los permisos";

export class GoogleIntegrationPermissionError extends Error {
  readonly statusCode: number;

  constructor(statusCode = 403) {
    super(GOOGLE_PERMISSION_RECONNECT_MESSAGE);
    this.name = "GoogleIntegrationPermissionError";
    this.statusCode = statusCode;
  }
}

export function isGooglePermissionError(
  error: unknown
): error is GoogleIntegrationPermissionError {
  return error instanceof GoogleIntegrationPermissionError;
}

export type TempCredentials = {
  email: string;
  tempPassword: string;
};

export function formatTempCredentialsCopyBlock(
  credentials: TempCredentials
): string {
  return `Email: ${credentials.email}\nContraseña: ${credentials.tempPassword}`;
}

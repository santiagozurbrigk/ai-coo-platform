import { getGoogleEnv } from "@/lib/google/oauth";

export async function refreshGoogleAccessToken(refreshToken: string): Promise<{
  access_token: string;
  expires_in?: number;
} | null> {
  const env = getGoogleEnv();
  if (!env) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: env.clientId,
      client_secret: env.clientSecret,
    }),
  });

  if (!res.ok) return null;
  return res.json();
}

import { NextResponse } from "next/server";

/** Headers para que Vercel/CDN no cacheen respuestas de callbacks OAuth. */
const OAUTH_NO_CACHE_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-cache, no-store, max-age=0, must-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
  Pragma: "no-cache",
};

export function withOAuthNoCache(response: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(OAUTH_NO_CACHE_HEADERS)) {
    response.headers.set(key, value);
  }
  return response;
}

import { describe, expect, it } from "vitest";
import { isPublicPath } from "../public-paths";

describe("isPublicPath", () => {
  it.each([
    "/api/webhooks/mercadopago",
    "/api/webhooks/whop",
    "/api/webhooks/fanbasis",
    "/api/webhooks/ghl",
    "/api/webhooks/instagram/messages",
    "/api/webhooks/unipile",
    "/api/discord/message",
    "/api/discord/testimonial",
    "/api/discord/pending-link",
    "/api/cron/sync-content-metrics",
    "/api/integrations/fathom/webhook",
    "/api/integrations/calendly/oauth/callback",
    "/login",
  ])("deja pasar %s sin sesión", (pathname) => {
    expect(isPublicPath(pathname)).toBe(true);
  });

  it.each([
    "/dashboard",
    "/clients",
    "/api/agent/send",
    "/api/agent/transcribe",
    "/api/content/analyze",
    "/api/integrations/stripe/disconnect",
    "/api/webhooksfake",
    "/api/discordx",
  ])("exige sesión en %s", (pathname) => {
    expect(isPublicPath(pathname)).toBe(false);
  });
});

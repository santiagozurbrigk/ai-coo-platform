import { describe, expect, it } from "vitest";
import { verifyUnipileSecret } from "../incoming-webhook";

const URL_BASE = "https://app.test/api/integrations/unipile/webhook";

describe("verifyUnipileSecret", () => {
  it("acepta el header Unipile-Auth que registra ensure-webhook", () => {
    const req = new Request(URL_BASE, { headers: { "Unipile-Auth": "s3cr3t" } });
    expect(verifyUnipileSecret(req, "s3cr3t")).toBe(true);
  });

  it("acepta ?secret= del notify_url del hosted auth", () => {
    expect(verifyUnipileSecret(new Request(`${URL_BASE}?secret=s3cr3t`), "s3cr3t")).toBe(true);
  });

  it("rechaza sin secreto, con secreto equivocado o sin secreto configurado", () => {
    expect(verifyUnipileSecret(new Request(URL_BASE), "s3cr3t")).toBe(false);
    expect(verifyUnipileSecret(new Request(`${URL_BASE}?secret=otro`), "s3cr3t")).toBe(false);
    expect(verifyUnipileSecret(new Request(`${URL_BASE}?secret=`), "")).toBe(false);
  });
});

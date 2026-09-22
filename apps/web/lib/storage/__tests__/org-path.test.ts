import { describe, expect, it } from "vitest";
import { assertOrgStoragePath, isOrgStoragePath } from "../org-path";

const ORG = "0000000a-0000-0000-0000-000000000000";
const OTRA = "0000000b-0000-0000-0000-000000000000";

describe("isOrgStoragePath", () => {
  it("acepta rutas dentro de la carpeta de la org", () => {
    expect(isOrgStoragePath(`${ORG}/doc-1-archivo.pdf`, ORG)).toBe(true);
    expect(isOrgStoragePath(`${ORG}/drafts/d1/a-b.png`, ORG)).toBe(true);
  });

  it("rechaza rutas de otra org, con .. o vacías", () => {
    expect(isOrgStoragePath(`${OTRA}/doc.pdf`, ORG)).toBe(false);
    expect(isOrgStoragePath(`${ORG}/../${OTRA}/doc.pdf`, ORG)).toBe(false);
    expect(isOrgStoragePath(`${ORG}//doc.pdf`, ORG)).toBe(false);
    expect(isOrgStoragePath(`${ORG}/`, ORG)).toBe(false);
    expect(isOrgStoragePath(`${ORG}x/doc.pdf`, ORG)).toBe(false);
    expect(isOrgStoragePath(undefined, ORG)).toBe(false);
  });

  it("assert tira con una ruta ajena", () => {
    expect(() => assertOrgStoragePath(`${OTRA}/doc.pdf`, ORG)).toThrow();
    expect(assertOrgStoragePath(`${ORG}/doc.pdf`, ORG)).toBe(`${ORG}/doc.pdf`);
  });
});

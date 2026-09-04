import { describe, expect, it } from "vitest";
import { extractSpeakerMatches } from "@/lib/fathom/crm-matches";

describe("⭐ el alias se aprende solo desde los crm_matches", () => {
  it("saca el par nombre de pantalla ↔ mail", () => {
    const matches = extractSpeakerMatches({
      crm_matches: [
        { matched_speaker_display_name: "iPhone de Juan", email: "juan@gmail.com" },
      ],
    });
    expect(matches).toEqual([
      {
        displayName: "iPhone de Juan",
        email: "juan@gmail.com",
        normalizedName: "iphone de juan",
        normalizedEmail: "juan@gmail.com",
      },
    ]);
  });

  it("acepta las variantes razonables del payload", () => {
    expect(
      extractSpeakerMatches({
        participants: [{ display_name: "Ana G", contact_email: "ana@x.com" }],
      })
    ).toHaveLength(1);
    expect(
      extractSpeakerMatches([{ name: "Ana G", matched_email: "ana@x.com" }])
    ).toHaveLength(1);
  });

  it("⭐ medio par no enseña nada: se descarta", () => {
    // Un alias sin mail asignaría llamadas al cliente equivocado.
    expect(
      extractSpeakerMatches({ crm_matches: [{ matched_speaker_display_name: "Juan" }] })
    ).toEqual([]);
    expect(extractSpeakerMatches({ crm_matches: [{ email: "juan@x.com" }] })).toEqual([]);
  });

  it("descarta un mail que no es un mail", () => {
    expect(
      extractSpeakerMatches({
        crm_matches: [{ matched_speaker_display_name: "Juan", email: "no-es-mail" }],
      })
    ).toEqual([]);
  });

  it("un nombre de pantalla que ES el mail no aporta alias nuevo", () => {
    expect(
      extractSpeakerMatches({
        crm_matches: [
          { matched_speaker_display_name: "juan@gmail.com", email: "juan@gmail.com" },
        ],
      })
    ).toEqual([]);
  });

  it("deduplica el mismo par repetido", () => {
    const matches = extractSpeakerMatches({
      crm_matches: [
        { matched_speaker_display_name: "Juan P", email: "juan@x.com" },
        { matched_speaker_display_name: "JUAN P", email: "Juan@X.com" },
      ],
    });
    expect(matches).toHaveLength(1);
  });

  it("un payload que no se entiende no rompe la sincronización", () => {
    expect(extractSpeakerMatches(null)).toEqual([]);
    expect(extractSpeakerMatches("texto")).toEqual([]);
    expect(extractSpeakerMatches({ crm_matches: "no es lista" })).toEqual([]);
    expect(extractSpeakerMatches({ crm_matches: [null, 3, "x"] })).toEqual([]);
  });
});

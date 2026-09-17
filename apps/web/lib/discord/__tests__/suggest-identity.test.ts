import { describe, expect, it } from "vitest";
import { sugerirIdentidad, type Candidato } from "../suggest-identity";

/** El equipo real de la organización Limitless, al 2026-09-17. */
const EQUIPO: Candidato[] = [
  { id: "fede", nombre: "Fede" },
  { id: "luckas", nombre: "Luckas Falco" },
  { id: "martin", nombre: "Martín" },
  { id: "agus", nombre: "Agus" },
  { id: "rama", nombre: "Rama" },
  { id: "naza-g", nombre: "Nazareno Gamero" },
  { id: "santi", nombre: "Santi" },
  { id: "naza", nombre: "Naza" },
  { id: "thiago", nombre: "Thiago" },
];

describe("sugerirIdentidad · las 7 personas del servidor real", () => {
  it("Luckas Falco coincide exacto aunque el usuario venga pegado", () => {
    expect(sugerirIdentidad(["Luckas Falco", "luckasfalco"], EQUIPO)).toEqual({
      id: "luckas",
      nombre: "Luckas Falco",
      nivel: "exacto",
    });
  });

  it("el usuario pegado solo también alcanza", () => {
    expect(sugerirIdentidad([null, "luckasfalco"], EQUIPO)?.nivel).toBe("exacto");
  });

  it("Nazareno Gamero coincide exacto por su nombre visible", () => {
    const s = sugerirIdentidad(["Nazareno Gamero", "nazag"], EQUIPO);
    expect(s?.id).toBe("naza-g");
    expect(s?.nivel).toBe("exacto");
  });

  it("Thiago Azcurra coincide fuerte con «Thiago»", () => {
    const s = sugerirIdentidad(["Thiago Azcurra", "thiagoazcc"], EQUIPO);
    expect(s?.id).toBe("thiago");
    expect(s?.nivel).toBe("fuerte");
  });

  it("Fede McEwen coincide fuerte con «Fede»", () => {
    const s = sugerirIdentidad(["Fede McEwen", "fgm_999"], EQUIPO);
    expect(s?.id).toBe("fede");
    expect(s?.nivel).toBe("fuerte");
  });

  it("Santiago Molina cae en «posible», no en fuerte", () => {
    const s = sugerirIdentidad(["Santiago Molina", "santiago.molinaaaa"], EQUIPO);
    expect(s?.id).toBe("santi");
    expect(s?.nivel).toBe("posible");
  });

  it("los que no son del equipo no reciben sugerencia", () => {
    expect(
      sugerirIdentidad(["Geronimo Robles", "geronimo_ads"], EQUIPO),
    ).toBeNull();
    expect(sugerirIdentidad(["Osne", "osneeal"], EQUIPO)).toBeNull();
  });
});

describe("sugerirIdentidad · no inventar", () => {
  it("un apodo de menos de tres letras no coincide con nada", () => {
    expect(sugerirIdentidad(["Na"], [{ id: "x", nombre: "Nazareno" }])).toBeNull();
    expect(sugerirIdentidad(["Jo"], [{ id: "x", nombre: "Joaquín" }])).toBeNull();
  });

  it("nombres sin nada en común no coinciden", () => {
    expect(
      sugerirIdentidad(["Carlos Pérez"], [{ id: "x", nombre: "Ana Gómez" }]),
    ).toBeNull();
  });

  it("los acentos no rompen la coincidencia", () => {
    expect(
      sugerirIdentidad(["Martin"], [{ id: "m", nombre: "Martín" }])?.nivel,
    ).toBe("exacto");
  });

  it("prefiere el exacto por sobre el fuerte aunque venga después", () => {
    const s = sugerirIdentidad(
      ["Juan Pérez"],
      [
        { id: "parcial", nombre: "Juan" },
        { id: "completo", nombre: "Juan Pérez" },
      ],
    );
    expect(s?.id).toBe("completo");
    expect(s?.nivel).toBe("exacto");
  });

  it("sin nombres o sin candidatos, nada", () => {
    expect(sugerirIdentidad([], EQUIPO)).toBeNull();
    expect(sugerirIdentidad([null, undefined, "  "], EQUIPO)).toBeNull();
    expect(sugerirIdentidad(["Luckas Falco"], [])).toBeNull();
    expect(sugerirIdentidad(["Luckas"], [{ id: "x", nombre: "" }])).toBeNull();
  });
});

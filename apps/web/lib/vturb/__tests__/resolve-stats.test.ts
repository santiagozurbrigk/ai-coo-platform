import { describe, expect, it } from "vitest";
import {
  isUsablePitchTime,
  resolveVTurbMeasures,
  usersAtSecond,
} from "../resolve-stats";

/** Respuesta de `/sessions/stats` con los campos que el spec declara. */
const STATS = {
  total_viewed: 1000,
  total_started: 620,
  total_over_pitch: 180,
  total_under_pitch: 440,
  over_pitch_rate: 29,
  engagement_rate: 41,
  play_rate: 62,
};

const ENGAGEMENT = {
  average_watched_time: 410,
  engagement_rate: 45,
  grouped_timed: [
    { timed: 0, total_users: 620 },
    { timed: 60, total_users: 400 },
    { timed: 600, total_users: 190 },
    { timed: 1200, total_users: 90 },
  ],
};

describe("isUsablePitchTime", () => {
  it("rechaza 0 — VTurb lo usa para 'no configurado'", () => {
    // Con pitch_time 0, total_over_pitch cuenta "los que vieron más de 0
    // segundos", que es casi todos. Parece M12 y no lo es.
    expect(isUsablePitchTime(0)).toBe(false);
  });

  it("rechaza null, undefined y negativos", () => {
    expect(isUsablePitchTime(null)).toBe(false);
    expect(isUsablePitchTime(undefined)).toBe(false);
    expect(isUsablePitchTime(-30)).toBe(false);
  });

  it("acepta un segundo positivo", () => {
    expect(isUsablePitchTime(600)).toBe(true);
  });
});

describe("usersAtSecond", () => {
  it("toma el punto exacto de la curva", () => {
    expect(usersAtSecond(ENGAGEMENT, 600)).toBe(190);
  });

  it("toma el último punto anterior si el segundo exacto no está", () => {
    // La curva no viene segundo a segundo. El último punto conocido antes del
    // CTA es la última cantidad de gente que sabemos que seguía mirando.
    expect(usersAtSecond(ENGAGEMENT, 700)).toBe(190);
  });

  it("devuelve null si el segundo es anterior al primer punto", () => {
    expect(usersAtSecond({ grouped_timed: [{ timed: 60, total_users: 10 }] }, 30)).toBeNull();
  });

  it("devuelve null sin curva", () => {
    expect(usersAtSecond(null, 600)).toBeNull();
    expect(usersAtSecond({}, 600)).toBeNull();
    expect(usersAtSecond({ grouped_timed: [] }, 600)).toBeNull();
  });

  it("ignora puntos malformados sin romperse", () => {
    const curve = {
      grouped_timed: [
        { timed: 60, total_users: 100 },
        { timed: "300", total_users: 50 },
        { timed: 200, total_users: null },
      ],
    } as unknown as Parameters<typeof usersAtSecond>[0];
    expect(usersAtSecond(curve, 600)).toBe(100);
  });
});

describe("resolveVTurbMeasures", () => {
  it("mapea las cuatro medidas con pitch time válido", () => {
    const result = resolveVTurbMeasures({
      stats: STATS,
      engagement: ENGAGEMENT,
      pitchTime: 600,
    });
    expect(result.pageViews).toBe(1000);
    expect(result.plays).toBe(620);
    expect(result.reachedCta).toBe(180);
    expect(result.reachedCtaReason).toBeNull();
  });

  it("prefiere el engagement_rate del endpoint de retención", () => {
    // Es el que tiene la fórmula documentada
    // (average_watched_time / video_duration * 100).
    const result = resolveVTurbMeasures({
      stats: STATS,
      engagement: ENGAGEMENT,
      pitchTime: 600,
    });
    expect(result.avgWatchPct).toBe(45);
  });

  it("cae al engagement_rate de stats si no hay retención", () => {
    const result = resolveVTurbMeasures({ stats: STATS, engagement: null, pitchTime: 600 });
    expect(result.avgWatchPct).toBe(41);
  });

  it("⭐ sin pitch time usable, M12 es null y no total_over_pitch", () => {
    // Aunque total_over_pitch venga con un número, sin un segundo de pitch
    // válido ese número no significa "llegó al CTA".
    const result = resolveVTurbMeasures({ stats: STATS, engagement: null, pitchTime: 0 });
    expect(result.reachedCta).toBeNull();
    expect(result.reachedCtaReason).toBe("no_pitch_time");
    // Las otras medidas sí siguen siendo válidas.
    expect(result.plays).toBe(620);
  });

  it("⭐ sin pitch time usable tampoco inventa desde la curva", () => {
    // Sin saber en qué segundo está el CTA, la curva no responde nada.
    const result = resolveVTurbMeasures({ stats: STATS, engagement: ENGAGEMENT, pitchTime: null });
    expect(result.reachedCta).toBeNull();
    expect(result.reachedCtaReason).toBe("no_pitch_time");
  });

  it("cae a la curva cuando falta total_over_pitch", () => {
    const result = resolveVTurbMeasures({
      stats: { total_started: 620 },
      engagement: ENGAGEMENT,
      pitchTime: 600,
    });
    expect(result.reachedCta).toBe(190);
    expect(result.reachedCtaReason).toBeNull();
  });

  it("⭐ un campo ausente es null, nunca 0", () => {
    // Que VTurb no devuelva total_started no significa que nadie reprodujo el
    // video: significa que no sabemos.
    const result = resolveVTurbMeasures({ stats: {}, engagement: null, pitchTime: 600 });
    expect(result.pageViews).toBeNull();
    expect(result.plays).toBeNull();
    expect(result.avgWatchPct).toBeNull();
    expect(result.reachedCta).toBeNull();
    expect(result.reachedCtaReason).toBe("no_data");
  });

  it("⭐ sin respuesta de VTurb, todo es null", () => {
    // Un error de red o una cuota agotada no son un cero.
    const result = resolveVTurbMeasures({ stats: null, engagement: null, pitchTime: 600 });
    expect(result.pageViews).toBeNull();
    expect(result.plays).toBeNull();
    expect(result.avgWatchPct).toBeNull();
    expect(result.reachedCta).toBeNull();
  });

  it("un cero real de VTurb sí se respeta", () => {
    // Distinto del caso anterior: acá VTurb dijo explícitamente que fue cero.
    const result = resolveVTurbMeasures({
      stats: { total_viewed: 0, total_started: 0, total_over_pitch: 0 },
      engagement: null,
      pitchTime: 600,
    });
    expect(result.pageViews).toBe(0);
    expect(result.plays).toBe(0);
    expect(result.reachedCta).toBe(0);
  });
});

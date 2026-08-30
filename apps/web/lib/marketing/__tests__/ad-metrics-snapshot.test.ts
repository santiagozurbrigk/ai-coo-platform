/**
 * Mapeo y deduplicación de métricas de anuncios (I-1).
 *
 * Cubre la parte pura de la captura: la que decide qué número termina en
 * `ad_metrics_daily`. El IO contra Zernio y Supabase queda fuera.
 */

import { describe, it, expect } from "vitest";
import {
  mapAdToRow,
  dedupeRows,
  type AdMetricsRow,
} from "../ad-metrics-snapshot";
import type { ZernioLinkedAd } from "@/lib/zernio/client";

const ORG = "org-1";
const DATE = "2026-08-28";

function makeAd(overrides: Record<string, unknown> = {}): ZernioLinkedAd {
  return {
    _id: "ad-1",
    name: "Creativo A",
    platform: "META",
    status: "ACTIVE",
    adType: "IMAGE",
    budget: { amount: 100, type: "daily" },
    campaignName: "Campaña 1",
    adSetName: "Adset 1",
    schedule: { startDate: "2026-08-01" },
    creative: {},
    metrics: {
      spend: 250.5,
      impressions: 10000,
      reach: 8000,
      clicks: 320,
    },
    ...overrides,
  } as unknown as ZernioLinkedAd;
}

describe("mapeo de anuncio a fila diaria", () => {
  it("copia las cuatro medidas que el documento asigna a Meta Ads", () => {
    const row = mapAdToRow(makeAd(), ORG, DATE)!;
    expect(row.spend).toBe(250.5);
    expect(row.impressions).toBe(10000);
    expect(row.reach).toBe(8000);
    expect(row.clicks).toBe(320);
  });

  it("guarda la identidad del anuncio y su jerarquía", () => {
    const row = mapAdToRow(makeAd(), ORG, DATE)!;
    expect(row.ad_external_id).toBe("ad-1");
    expect(row.ad_name).toBe("Creativo A");
    expect(row.campaign_name).toBe("Campaña 1");
    expect(row.ad_set_name).toBe("Adset 1");
    expect(row.organization_id).toBe(ORG);
    expect(row.metric_date).toBe(DATE);
  });

  it("normaliza la plataforma a minúsculas", () => {
    expect(mapAdToRow(makeAd({ platform: "META" }), ORG, DATE)!.platform).toBe("meta");
  });

  it("cae a 'meta' si la plataforma viene vacía", () => {
    expect(mapAdToRow(makeAd({ platform: "" }), ORG, DATE)!.platform).toBe("meta");
  });

  it("descarta un anuncio sin id", () => {
    expect(mapAdToRow(makeAd({ _id: "" }), ORG, DATE)).toBeNull();
  });

  describe("números que llegan sucios", () => {
    it("acepta métricas como string", () => {
      const ad = makeAd({ metrics: { spend: "99.9", impressions: "500", reach: "400", clicks: "12" } });
      const row = mapAdToRow(ad, ORG, DATE)!;
      expect(row.spend).toBe(99.9);
      expect(row.clicks).toBe(12);
    });

    it("un anuncio sin métricas queda en cero, no rompe", () => {
      const row = mapAdToRow(makeAd({ metrics: undefined }), ORG, DATE)!;
      expect(row.spend).toBe(0);
      expect(row.clicks).toBe(0);
    });

    it("descarta valores no numéricos", () => {
      const ad = makeAd({ metrics: { spend: "no-es-un-numero", impressions: null, reach: NaN, clicks: 5 } });
      const row = mapAdToRow(ad, ORG, DATE)!;
      expect(row.spend).toBe(0);
      expect(row.impressions).toBe(0);
      expect(row.reach).toBe(0);
      expect(row.clicks).toBe(5);
    });

    it("un anuncio que existe pero no gastó guarda 0, no null", () => {
      // Acá el cero es un dato real: el anuncio corrió y no gastó. La distinción
      // null vs 0 de §9.1 vive en el resolver del embudo, no en la captura.
      const row = mapAdToRow(makeAd({ metrics: { spend: 0, impressions: 0, reach: 0, clicks: 0 } }), ORG, DATE)!;
      expect(row.spend).toBe(0);
      expect(row.spend).not.toBeNull();
    });
  });
});

describe("deduplicación", () => {
  const row = (id: string, clicks: number, date = DATE): AdMetricsRow => ({
    organization_id: ORG,
    metric_date: date,
    platform: "meta",
    ad_external_id: id,
    ad_name: null,
    campaign_name: null,
    ad_set_name: null,
    spend: 0,
    impressions: 0,
    reach: 0,
    clicks,
  });

  it("colapsa el mismo anuncio repetido y se queda con el último", () => {
    // Zernio devuelve el mismo _id más de una vez cuando el anuncio está en
    // varios adsets; sin esto el upsert choca contra sí mismo en el batch.
    const result = dedupeRows([row("ad-1", 10), row("ad-1", 25)]);
    expect(result).toHaveLength(1);
    expect(result[0]!.clicks).toBe(25);
  });

  it("no colapsa anuncios distintos", () => {
    expect(dedupeRows([row("ad-1", 10), row("ad-2", 5)])).toHaveLength(2);
  });

  it("no colapsa el mismo anuncio en días distintos", () => {
    expect(dedupeRows([row("ad-1", 10), row("ad-1", 5, "2026-08-29")])).toHaveLength(2);
  });

  it("una lista vacía devuelve vacío", () => {
    expect(dedupeRows([])).toEqual([]);
  });
});

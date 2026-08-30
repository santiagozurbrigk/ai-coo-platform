---
title: "Facebook Reporting"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/facebook-reporting"
seccion: "Ad Manager > Facebook Reporting"
api_version: "v3"
capturado: "2026-08-30"
---

# Facebook Reporting

Documentation for Ad-publishing API

- [Get reporting data](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-reporting) — Retrieve aggregated Facebook ad reporting metrics for a location. `grouped` holds one row per `groupBy` period, or a single row covering the whole range when `groupBy` is omitted, and `totals` aggregates across them. Both objects only carry the metrics named in `fields`. Be aware that ratio metrics (`cpm`, `ctr`, `frequency`) are summed rather than weighted in `totals`, and that `cost_per_conversion` and `cost_per_result` are placeholders that always read `0` — their real values live under `costPerConversion` and `costPerResult`.
- [Get campaign reporting](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-campaign-reporting) — Retrieve reporting for one campaign as a flat object, not the `{ grouped, totals }` envelope the account-level report uses. Merges the locally stored campaign, Meta insights for the window, and CDP-attributed contacts. The campaign must be published — one without an `fbCampaignId` is rejected. Note `results.lead` (Meta lead actions) and `leads` (CDP attributed contacts) measure different things and routinely disagree.
- [Get reporting list](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-reporting-list) — Retrieve campaigns, ad sets, or ads with their reporting metrics. `listType` selects the entity and changes the item shape; `adsets` and `ads` additionally require `campaignId`. Entities Meta has no insights for are still returned, padded with a fixed zero row that carries fewer fields than a real one. Note `none` is accepted by validation but has no handler and fails with a 409.

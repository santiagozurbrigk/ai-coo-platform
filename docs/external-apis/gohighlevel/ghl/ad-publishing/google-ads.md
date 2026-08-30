---
title: "Google Ads"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-ads"
seccion: "Ad Manager > Google Ads"
api_version: "v3"
capturado: "2026-08-30"
---

# Google Ads

Documentation for Ad-publishing API

- [Get conversions](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-conversions) — Retrieve Google Ads conversion actions for a location. The response shape is selected by `type`. When `type` is `AD_MANAGER`: without `limit` a plain array of full conversion actions, and with `limit` (max 100, default 100) a paginated `{ conversions, paging }` envelope — pass `pageToken` (from `paging.next`) for the next batch. When `type` is omitted or `AD_WORDS`, a different, minimal snake_case projection is returned and `limit`, `pageToken`, `startDate`, `endDate`, `conversionType` and `category` are all ignored.
- [Upsert conversion](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-upsert-conversion) — Create or update a Google Ads conversion action
- [Get conversion by ID](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-conversion-by-id) — Retrieve a specific Google Ads conversion action by ID
- [Delete conversion](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-delete-conversion) — Delete a Google Ads conversion action by ID
- [Publish ad](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-publish-ad) — Publish a Google ad and push it live
- [Get ad publishing progress](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-publishing-progress) — Returns Redis-backed publish progress for a Google campaign while it is publishing. Used by the publish progress UI to poll step counts and completion state.
- [Search targeting options](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-search-targeting) — Search Google geo-locations for ad targeting
- [Get keyword ideas](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-keyword-ideas) — Retrieve keyword suggestions for Google Ads campaigns
- [Get assets](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-assets) — Retrieve Google Ads creative assets for a location. Without `limit` the response is a plain array of assets. When `limit` is provided (max 100, default 100) the response is a paginated `{ assets, paging }` envelope; pass `pageToken` (from `paging.next`) to fetch the next batch.
- [Upsert assets](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-upsert-assets) — Create or update Google Ads creative assets
- [Get entities](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-entity) — Retrieve Google campaigns, ad groups, or ads based on entity type
- [Get target interests](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-target-interests) — Retrieve affinity and in-market audience options for Google Ads targeting. Without `limit` the response is a plain array of root interests (each with a nested children tree). When `limit` is provided (max 100) the response is a paginated `{ targetInterests, paging }` envelope — a page counts root interests; pass `pageToken` (from `paging.next`) to fetch the next batch. By default each node is returned in full; pass `projection` (comma-separated, e.g. ?projection=name,userInterestId,children) to return only the requested fields — selecting `children` prunes the whole tree recursively with the same selection, and any value outside the known field set is rejected.
- [Get segments](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-segments) — Retrieve Google Ads audience segments for a location. Without `limit` the response is a plain array. When `limit` is provided (max 100, default 100) the response is a paginated `{ segments, paging }` envelope; pass `pageToken` (from `paging.next`) to fetch the next batch.
- [Upsert segment](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-upsert-segment) — Create or update a Google Ads audience segment
- [Delete segment](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-delete-segment) — Delete a Google Ads audience segment by ID
- [Get segment by ID](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-segment-by-id) — Retrieve a specific Google Ads audience segment by ID
- [Create offline user list job](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-create-offline-user-list-job) — Create a job to upload users to a Google customer match list
- [Upsert audience](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-upsert-audience) — Create or update a Google Ads combined audience
- [Get audiences](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-audiences) — Retrieve Google Ads combined audiences for a location. Without `limit` the response is a plain array. When `limit` is provided (max 100, default 100) the response is a paginated `{ audiences, paging }` envelope; pass `pageToken` (from `paging.next`) to fetch the next batch.
- [Get audience by ID](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-audience-by-id) — Retrieve a specific Google Ads combined audience by ID
- [Upsert Google campaign](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-upsert-campaign) — Create or update a full Google Ads campaign structure
- [Get Google campaign by ID](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-campaign-by-id) — Retrieve a specific Google Ads campaign by ID
- [Get conversion goals](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-get-conversion-goals) — Retrieve Google Ads conversion goals for a location. Without `limit` the response is a plain array. When `limit` is provided (max 100, default 100) the response is a paginated `{ conversionGoals, paging }` envelope; pass `pageToken` (from `paging.next`) to fetch the next batch.

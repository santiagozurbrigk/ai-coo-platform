---
title: "lc-phone"
source: "https://marketplace.gohighlevel.com/docs/ghl/phone-system/lc-phone"
seccion: "LC Phone > lc-phone"
api_version: "v3"
capturado: "2026-08-30"
---

# lc-phone

API Service for LC Phone

- [List number pools](https://marketplace.gohighlevel.com/docs/ghl/phone-system/get-number-pool-list) — Returns number pools for the location. Requires locationId as a query parameter.
- [List available phone numbers](https://marketplace.gohighlevel.com/docs/ghl/phone-system/list-available-numbers-for-a-country) — Search Twilio inventory for purchasable phone numbers in a country for the given location.
- [Purchase number for location](https://marketplace.gohighlevel.com/docs/ghl/phone-system/purchase-number-for-location) — Purchase number for location. With `version: v3`, the HTTP 201 body is the standard success envelope (`status`, `data`, `message`, `statusCode`). The v3 purchase fields live under `data`: `number`, `locationId`, `id`, and `underLcAccount` (renamed from under_ghl_account).
- [List active numbers](https://marketplace.gohighlevel.com/docs/ghl/phone-system/active-numbers) — List active numbers. With `version: v3`, the HTTP 200 body is the standard success envelope (`status`, `data`, `message`, `statusCode`). The v3 list payload is under `data`; `isUnderGhl` is renamed to `isUnderLc` per AIP naming convention.

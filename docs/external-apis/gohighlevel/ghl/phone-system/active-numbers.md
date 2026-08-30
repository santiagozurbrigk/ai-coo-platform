---
title: "List active numbers"
source: "https://marketplace.gohighlevel.com/docs/ghl/phone-system/active-numbers"
seccion: "LC Phone > lc-phone > List active numbers"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/phone-system/numbers/location/:locationId"
---

# List active numbers

```http
GET /phone-system/numbers/location/:locationId
```

List active numbers. With `version: v3`, the HTTP 200 body is the standard success envelope (`status`, `data`, `message`, `statusCode`). The v3 list payload is under `data`; `isUnderGhl` is renamed to `isUnderLc` per AIP naming convention.

## Request

### Header parameters

- **version** `string` _required_ — Send `v3` to use the v3 response contract (AIP). This is the supported version value for these endpoints.
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID as string

### Query parameters

- **pageSize** `number` — How many resources to return in each list page. The default is 50, and the maximum is 1000. **Possible values:** `>= 1` and `<= 1000`
- **page** `number` — The page index. The default is 0. **Possible values:** `>= 0`
- **searchFilter** `string` — Number search Filter
- **skipNumberPool** `boolean` — When true, exclude numbers assigned to number pools from the list.

  Default value:

  `true`

- **includeRcsSenderIds** `boolean` — Include RCS Sender IDs

### Response (200 · application/json)

Success envelope; v3 list details are in `data` (including `isUnderLc` instead of legacy `isUnderGhl`).

**Schema**

- **status** `string` _required_ — Outcome indicator from the shared success helper.
  - Available options: `success`
- **data** `object` _required_ — V3 list payload: numbers, pagination fields, isUnderLc (renamed from isUnderGhl), etc.
- **message** `string` _required_ — Human-readable success message.
- **statusCode** `number` _required_ — HTTP status echoed in the response body.

```json
{
  "status": "success",
  "data": {
    "numbers": [
      {
        "phoneNumber": "+17745678902",
        "friendlyName": "Main line",
        "countryCode": "US"
      }
    ],
    "isUnderLc": true,
    "pageSize": 50,
    "page": 0,
    "accountStatus": "active",
    "total": 1
  },
  "message": "OK",
  "statusCode": 200
}
```

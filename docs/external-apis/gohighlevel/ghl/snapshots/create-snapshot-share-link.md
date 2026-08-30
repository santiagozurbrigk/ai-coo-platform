---
title: "Create Snapshot Share Link"
source: "https://marketplace.gohighlevel.com/docs/ghl/snapshots/create-snapshot-share-link"
seccion: "Snapshots > Snapshots > Create Snapshot Share Link"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/snapshots/share/link"
---

# Create Snapshot Share Link

```http
POST /snapshots/share/link
```

Create a share link for snapshot

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **companyId** `string` _required_

### Request body (application/json)

**Body required**

- **snapshot_id** `string` _required_ — id for snapshot to be shared
- **share_type** `string` _required_ — Type of share link to generate
  - Available options: `link`, `permanent_link`, `agency_link`, `location_link`
- **relationship_number** `string` — Comma separated Relationship number of Agencies to create agency restricted share link
- **share_location_id** `string` — Comma separated Sub-Account ids to create sub-account restricted share link

```json
{
  "snapshot_id": "1eM2UgkfaECOYyUdCo9Pa",
  "share_type": "permanent_link",
  "relationship_number": "0-128-926,1-208-926,2-008-926",
  "share_location_id": "l1C08ntBrFjLS0elLIYU, U1C08ntBrFjLS0elKIYP"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **id** `string` — id for shared snapshot
- **shareLink** `string` — Share Link for snapshot

```json
{
  "id": "1eM2UgkfaECOYyUdCo9Pa",
  "shareLink": "https://affiliates.gohighlevel.com/?share=1eM2UgkfaECOYyUdCo9Pa"
}
```

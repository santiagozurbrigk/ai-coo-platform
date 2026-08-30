---
title: "Create offline user list job"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/google-create-offline-user-list-job"
seccion: "Ad Manager > Google Ads > Create offline user list job"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/google/segments/offline-user-list-job"
---

# Create offline user list job

```http
POST /ad-publishing/google/segments/offline-user-list-job
```

Create a job to upload users to a Google customer match list

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location identifier
- **smartListIds** `string[]` — Smart list IDs
- **csvPath** `string` — CSV file path
- **userListId** `string` — User list identifier
- **isDynamic** `boolean` — Dynamic list flag

```json
{
  "locationId": "loc_abc123",
  "smartListIds": [
    "sl_123"
  ],
  "csvPath": "/uploads/users.csv",
  "userListId": "ul_123",
  "isDynamic": false
}
```

### Response (200 · application/json)

Acknowledgement that the offline job was queued

**Schema**

- **success** `boolean` _required_ — True when the operation succeeded

```json
{
  "success": true
}
```

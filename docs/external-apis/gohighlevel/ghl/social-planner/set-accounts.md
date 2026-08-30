---
title: "Set Accounts"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/set-accounts"
seccion: "Social Planner > CSV > Set Accounts"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/:locationId/set-accounts"
---

# Set Accounts

```http
POST /social-media-posting/:locationId/set-accounts
```

Set social media accounts for a CSV import to publish posts to

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **accountIds** `string[]` _required_ — Account Ids
- **filePath** `string` _required_ — File path
- **rowsCount** `number` _required_ — Entries Count. rowsCount must be between 1 and number of posts in CSV
- **fileName** `string` _required_ — Name of file
- **approver** `string` — Approver User Id
- **userId** `string` _required_ — User ID
- **csvFileType** `string` — CSV file type - determines the format of the CSV file being imported
  - Available options: `basic`, `advance`

```json
{
  "accountIds": [
    "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"
  ],
  "filePath": "omaDY3RbWtTP511e/social-import/d23d68c2-82c0-1db6e2.csv",
  "rowsCount": 1,
  "fileName": "test.csv",
  "approver": "o6241QsiRwUIJHyjuhos",
  "userId": "ve9EPM428h8vShlRW1KT",
  "csvFileType": "basic"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Accounts Set Successfully",
  "results": {
    "csvId": "6953a0be84b7ff10f6025d53"
  }
}
```

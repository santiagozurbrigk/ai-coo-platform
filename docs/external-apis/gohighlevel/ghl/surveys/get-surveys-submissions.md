---
title: "Get Surveys Submissions"
source: "https://marketplace.gohighlevel.com/docs/ghl/surveys/get-surveys-submissions"
seccion: "Surveys > Surveys > Get Surveys Submissions"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/surveys/submissions"
---

# Get Surveys Submissions

```http
GET /surveys/submissions
```

Get Surveys Submissions

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_
- **page** `number` — Page No. By default it will be 1

  Default value:

  `1`

- **limit** `number` — Limit Per Page records count. will allow maximum up to 100 and default will be 20

  Default value:

  `20`

- **surveyId** `string` — Filter submission by survey id
- **q** `string` — Filter by contactId, name, email or phone no.
- **startAt** `string` — Get submission by starting of this date. By default it will be same date of last month(YYYY-MM-DD).
- **endAt** `string` — Get submission by ending of this date. By default it will be current date(YYYY-MM-DD).

### Response (200 · application/json)

Successful response

**Schema**

- **submissions** `object[]`
- **meta** `object`

```json
{
  "submissions": [
    {
      "id": "be759b9a-c3ec-4b29-ba07-fc3c89c77673",
      "contactId": "9NkT25Vor1v4aQatFsv2",
      "createdAt": "2020-11-01T18:02:21.000Z",
      "surveyId": "jjusM6EOngDExnbo2DbU",
      "name": "test",
      "email": "[email protected]",
      "others": {
        "__submissions_other_field__": "[email protected]",
        "__custom_field_id__": "20",
        "eventData": {
          "fbc": "fb.1.123456789.987654321",
          "fbp": "fbp.1.987654321.123456789",
          "page": {
            "url": "https://example.com",
            "title": "Example Page"
          },
          "type": "page-visit",
          "domain": "example.com",
          "medium": "survey",
          "source": "Direct traffic",
          "version": "v3",
          "adSource": "example-ad-source",
          "mediumId": "medium-id-123",
          "parentId": "parent-id-456",
          "referrer": "https://staging.gohighlevel.com",
          "fbEventId": "event-id-789",
          "timestamp": 1234567890,
          "parentName": "Parent Survey",
          "fingerprint": "example-fingerprint",
          "pageVisitType": "survey",
          "contactSessionIds": {
            "ids": [
              "session1",
              "session2"
            ]
          }
        },
        "fieldsOriSequance": [
          "full_name",
          "first_name",
          "last_name",
          "phone",
          "email"
        ]
      }
    }
  ],
  "meta": {
    "total": 1,
    "currentPage": 1,
    "nextPage": null,
    "prevPage": null
  }
}
```

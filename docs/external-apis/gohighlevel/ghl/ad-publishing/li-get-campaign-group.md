---
title: "Get ad campaign group"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-get-campaign-group"
seccion: "Ad Manager > LinkedIn Ads > Get ad campaign group"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/linkedin/ads/:adId"
---

# Get ad campaign group

```http
GET /ad-publishing/linkedin/ads/:adId
```

Retrieve a LinkedIn ad campaign group by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **adId** `string` _required_ — Ad identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Response (200 · application/json)

The campaign group with its ad campaigns and their ads

**Schema**

- **id** `string` _required_ — Campaign group identifier
- **name** `string` _required_ — Campaign group name
- **locationId** `string` _required_ — Location identifier
- **linkedInAdAccountId** `string` _required_ — LinkedIn ad account id the group belongs to
- **adCampaignGroupId** `string` — LinkedIn campaign group id, set once published
- **publishingStatus** `string` _required_ — Publishing status
- **linkedInError** `string` _required_ — Publish or review error from LinkedIn. Empty string when there is none.
- **objectiveType** `string` _required_ — Campaign objective
  - Available options: `LEAD_GENERATION`, `WEBSITE_VISIT`
- **adBudgetOptimization** `string` — Budget optimisation mode
  - Available options: `MAXIMUM_DELIVERY`, `COST_CAP`
- **budget** `object` _required_ — Budget configuration
- **adCampaigns** `object[]` _required_ — Ad campaigns with their ads
- **meta** `object` — Ancillary metadata
- **unpublishedChanges** `boolean` — Whether the group has edits not yet published. Absent on reads that have never been edited; set by the upsert.
- **createdBy** `string` _required_ — User who created the group
- **updatedBy** `string` _required_ — User who last updated the group
- **createdAt** `string` _required_ — Created at
- **updatedAt** `string` _required_ — Updated at

```json
{
  "id": "6a840c5a1c2e6acf77b1d258",
  "name": "Q3 demand generation",
  "locationId": "fRMewNQIxSyZ5R4nQyit",
  "linkedInAdAccountId": "556129919",
  "adCampaignGroupId": "1192521246",
  "publishingStatus": "PAUSED",
  "linkedInError": "",
  "objectiveType": "WEBSITE_VISIT",
  "adBudgetOptimization": "MAXIMUM_DELIVERY",
  "budget": {
    "budgetType": "DAILY",
    "amount": 30,
    "scheduleStartDate": "2026-08-18T07:40:10.110Z",
    "scheduleEndDate": "2026-09-17T07:40:10.110Z"
  },
  "adCampaigns": [
    {
      "id": "6a840c7b1c2e6acf77b1d2a5",
      "name": "Ad set 1",
      "adCampaignGroupId": "6a840c5a1c2e6acf77b1d258",
      "adCampaignId": "869320926",
      "publishingStatus": "PAUSED",
      "linkedInError": "",
      "campaignType": "SPONSORED_UPDATES",
      "mediaType": "STANDARD_UPDATE",
      "locale": {
        "country": "US",
        "language": "en"
      },
      "unitCost": {
        "amount": 1
      },
      "audience": {
        "geoLocations": [
          {
            "name": "Mumbai, Maharashtra, India",
            "urn": "urn:li:geo:106164952",
            "facetUrn": "urn:li:adTargetingFacet:locations",
            "selectionType": "include"
          }
        ],
        "targetAudience": {
          "include": [],
          "exclude": []
        }
      },
      "ads": [
        {
          "id": "6a840c7b1c2e6acf77b1d2a8",
          "name": "Ad 1",
          "adCampaignId": "6a840c7b1c2e6acf77b1d2a5",
          "adCampaignGroupId": "6a840c5a1c2e6acf77b1d258",
          "adId": "1554451156",
          "publishingStatus": "FAILED",
          "linkedInError": "",
          "introductoryText": "Grow your pipeline this quarter",
          "description": "",
          "destinationUrl": "https://example.com",
          "destinationFormId": "",
          "callToActionLabel": "APPLY",
          "contentReferenceString": "urn:li:share:7495384246371512320",
          "media": [
            {
              "type": "image",
              "src": "https://staging.files.leadconnectorhq.com/file/abc/def.png",
              "name": "creative.png",
              "headline": "Try it free",
              "destinationUrl": "example.com",
              "fileSizeBytes": 1066210,
              "urn": "urn:li:image:D5610AQEjSUtmzK0rjw",
              "_id": "6a840c881c2e6acf77b1d3c9"
            }
          ],
          "createdAt": "2026-08-18T07:40:43.385Z",
          "updatedAt": "2026-08-18T07:45:04.624Z"
        }
      ],
      "createdAt": "2026-08-18T07:40:43.369Z",
      "updatedAt": "2026-08-18T07:45:04.746Z"
    }
  ],
  "meta": {
    "evaluate": "{\"opportunityScore\":60,\"confidence\":\"High\",\"band\":\"Medium\",\"categories\":[],\"fixItems\":[]}"
  },
  "unpublishedChanges": true,
  "createdBy": "uPy3hdVIuuNlbWOpBYGw",
  "updatedBy": "uPy3hdVIuuNlbWOpBYGw",
  "createdAt": "2026-08-18T07:40:10.354Z",
  "updatedAt": "2026-08-18T07:45:04.812Z"
}
```

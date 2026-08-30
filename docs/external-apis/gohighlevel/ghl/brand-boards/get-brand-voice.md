---
title: "Get Brand Voice"
source: "https://marketplace.gohighlevel.com/docs/ghl/brand-boards/get-brand-voice"
seccion: "Brand Boards > Brand Voices > Get Brand Voice"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/brand-boards/locations/:locationId/brand-voices/:brandVoiceId"
---

# Get Brand Voice

```http
GET /brand-boards/locations/:locationId/brand-voices/:brandVoiceId
```

Get a brand voice by ID

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID
- **brandVoiceId** `string` _required_ — Brand voice ID

### Response (200 · application/json)

Success

**Schema**

- **id** `string` _required_ — Brand voice ID
- **name** `string` _required_ — Brand voice name
- **isDefault** `boolean` _required_ — Whether this is the default brand voice
- **createdAt** `string` _required_ — Creation timestamp
- **updatedAt** `string` _required_ — Last update timestamp
- **locationId** `string` _required_ — Location ID
- **deleted** `boolean` _required_ — Whether the brand voice has been soft deleted
- **answers** `object` — Brand voice answers
- **traceId** `string` — Trace ID of request

```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "My Brand Voice",
  "isDefault": false,
  "createdAt": "2024-01-05T12:00:00.000Z",
  "updatedAt": "2024-01-05T12:00:00.000Z",
  "locationId": "oHJiAh0wDG3BzmzACVD6",
  "deleted": false,
  "answers": {
    "brandName": "Acme Inc",
    "toneOfVoice": "Professional and friendly",
    "targetAudience": "Small business owners",
    "customerPainPoints": "Difficulty with time management",
    "businessType": "Software Development",
    "companyWebsite": "https://example.com",
    "companyEmail": "[email protected]",
    "companyAddress": "123 Main St, Anytown, CA",
    "phone": {
      "phoneNumber": "5551234567",
      "countryCode": "US"
    },
    "businessHours": "Mon-Fri 9am-5pm",
    "brandPromise": "We deliver on time, every time",
    "brandValues": "Integrity, Excellence, Innovation",
    "brandPurpose": "To empower small businesses with technology",
    "competitiveAdvantage": "Proprietary AI technology",
    "risksOfInaction": "Falling behind competitors",
    "uniqueSellingProposition": "The only solution that integrates with all major platforms",
    "callToAction": "Schedule a demo today"
  },
  "traceId": "019e4ef5-a65e-4198-8cf9-8e93dca9bda4"
}
```

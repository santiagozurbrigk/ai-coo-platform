---
title: "Get lead form by ID"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-lead-form"
seccion: "Ad Manager > Facebook Integration > Get lead form by ID"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/ad-publishing/facebook/lead-form/:leadFormId"
---

# Get lead form by ID

```http
GET /ad-publishing/facebook/lead-form/:leadFormId
```

Retrieve a lead form by id. Pass `isDraft=true` to read an unpublished local draft instead, in which case `leadFormId` accepts either the bare id or the `draft_`-prefixed form the listing endpoint reports. The two branches return different shapes, and neither matches the shape the listing endpoint returns for the same form: the published branch carries the full Meta definition (context card, thank-you page, legal content) but no `status`, `createdTime`, or `pageId`, while the draft branch returns the stored document verbatim under `_id`.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **leadFormId** `string` _required_ — Lead form identifier

### Query parameters

- **locationId** `string` _required_ — Location identifier
- **isDraft** `boolean` — Fetch the unpublished draft of this lead form instead of the published form

### Response (200 · application/json)

The published form from Meta, or the stored draft when `isDraft` is set

**Schema**

oneOf

- **id** `string` _required_ — Facebook lead form id
- **name** `string` _required_ — Form name
- **locale** `string` _required_ — Form locale, lower-cased by Meta
- **questions** `object[]` _required_ — Questions on the form
- **contextCard** `object` — Intro card shown before the questions. The draft representation calls this `greetingCard`.
- **questionPageCustomHeadline** `string` — Headline above the questions. The draft representation calls this `questionPageHeadline`.
- **isOptimizedForQuality** `boolean` — Whether the form uses the higher-intent flow, which adds a review step. Set when the form was created with `type: HIGHER_INTENT`.
- **privacyPolicyUrl** `string` — Privacy policy URL, repeated from `legalContent.privacyPolicy.url`
- **thankYouPage** `object` — Confirmation screen
- **followUpActionUrl** `string` — URL the follow-up action opens
- **followUpActionText** `string` — Label for the follow-up action. Omitted by Meta when unset.
- **legalContent** `object` — Privacy policy and disclaimer

```json
{
  "id": "1731762131493784",
  "name": "Automation Lead Form 2026-07-16 00:22:40",
  "locale": "en_US",
  "questions": [
    {
      "id": "1751700749315902",
      "key": "full_name",
      "label": "What is your name?",
      "type": "CUSTOM",
      "options": [
        {
          "key": "Option 1",
          "value": "Option 1"
        }
      ]
    }
  ],
  "contextCard": {
    "id": "1320904143101881",
    "title": "Test Lead Form",
    "content": [
      "Automation test lead form"
    ],
    "style": "PARAGRAPH_STYLE"
  },
  "questionPageCustomHeadline": "Test Lead Form - Headline",
  "isOptimizedForQuality": false,
  "privacyPolicyUrl": "https://example.com/privacy",
  "thankYouPage": {
    "id": "1778746963315596",
    "title": "Thank You",
    "body": "We will contact you shortly.",
    "buttonText": "View website",
    "buttonType": "VIEW_WEBSITE",
    "websiteUrl": "https://example.com/",
    "enableMessenger": false
  },
  "followUpActionUrl": "https://example.com/",
  "followUpActionText": "Visit us",
  "legalContent": {
    "id": "1975017193204256",
    "privacyPolicy": {
      "url": "https://example.com/privacy",
      "linkText": "We respect your privacy"
    },
    "customDisclaimer": {
      "title": "Terms & Conditions",
      "body": {
        "text": "By submitting..."
      },
      "checkboxes": [
        {
          "id": "851816397792714",
          "key": "terms_and_conditions",
          "text": "I agree to the terms & conditions",
          "isRequired": false,
          "isCheckedByDefault": false
        }
      ]
    }
  }
}
```

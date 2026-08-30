---
title: "Create page lead form"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-create-page-lead-form"
seccion: "Ad Manager > Facebook Integration > Create page lead form"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/facebook/page/:pageId/forms"
---

# Create page lead form

```http
POST /ad-publishing/facebook/page/:pageId/forms
```

Create a lead gen form. With `isDraft: true` the form is stored locally and returned as a draft; without it the form is published to Facebook and the Meta record is returned. The two responses share almost no fields. Publishing enforces at least one question and a complete `thankYouPage` (title, body, buttonText) where a draft save enforces neither. Pass `draftFormId` when publishing an existing draft to have it deleted afterwards — either the bare id or the `draft_`-prefixed form is accepted, and cleanup failures are logged rather than surfaced.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **pageId** `string` _required_ — Facebook page identifier

### Request body (application/json)

**Body required**

- **type** `string` _required_ — Lead form type
  - Available options: `MORE_VOLUME`, `HIGHER_INTENT`
- **name** `string` _required_ — Lead form name
- **locationId** `string` _required_ — Location identifier
- **greetingCard** `object` — Greeting card config
- **questions** `object[]` _required_ — List of questions displayed on the lead form. Required (non-empty) when `isDraft` is false or omitted; optional for drafts.
- **questionPageHeadline** `string` — Question page headline
- **privacyPolicyLink** `string` _required_ — Privacy policy URL. Required when `isDraft` is false or omitted; optional for drafts.
- **privacyPolicyText** `string` — Privacy policy text
- **customDisclaimer** `object` — Custom disclaimer config
- **thankYouPage** `object` _required_ — Thank you page config. Required when `isDraft` is false or omitted; optional for drafts.
- **isDraft** `boolean` — If the form is a draft, set to true
- **draftFormId** `string` — Draft form ID
- **locale** `string` — Locale

```json
{
  "type": "MORE_VOLUME",
  "name": "Contact Form",
  "locationId": "loc_abc123",
  "greetingCard": {
    "title": "Welcome!",
    "style": "LIST_STYLE",
    "content": [
      "Learn more about our services"
    ]
  },
  "questions": [
    {
      "key": "full_name",
      "type": "FULL_NAME",
      "options": []
    },
    {
      "key": "email_address",
      "type": "EMAIL",
      "options": []
    },
    {
      "key": "are_you_interested",
      "label": "Are you interested?",
      "type": "CUSTOM",
      "options": [
        {
          "value": "Yes"
        },
        {
          "value": "No"
        }
      ]
    }
  ],
  "questionPageHeadline": "Tell us about yourself",
  "privacyPolicyLink": "https://example.com/privacy",
  "privacyPolicyText": "We respect your privacy",
  "customDisclaimer": {
    "title": "Terms & Conditions",
    "body": "By submitting...",
    "checkboxes": [
      {
        "isRequired": true,
        "text": "I agree",
        "key": "terms"
      }
    ]
  },
  "thankYouPage": {
    "title": "Thank You!",
    "body": "We will contact you soon",
    "buttonText": "Visit Website",
    "buttonType": "VIEW_WEBSITE",
    "buttonLink": "https://example.com"
  },
  "isDraft": true,
  "draftFormId": "1234567890",
  "locale": "EN_US"
}
```

### Response (201 · application/json)

The stored draft when `isDraft` is set, otherwise the form as published to Facebook

**Schema**

oneOf

- **id** `string` _required_ — Draft id, unprefixed. The listing endpoint reports this same draft as `draft_<id>`.
- **isDraft** `boolean` _required_ — Always true on this branch
- **name** `string` _required_ — Form name
- **locationId** `string` _required_ — Owning location
- **pageId** `string` _required_ — Page the draft will publish to
- **type** `string` — Lead form objective
  - Available options: `MORE_VOLUME`, `HIGHER_INTENT`
- **locale** `string` _required_ — Form locale, upper-cased as stored
- **createdAt** `string` _required_ — Creation time, ISO-8601
- **updatedAt** `string` _required_ — Last modification time, ISO-8601. Equal to `createdAt` on a fresh draft.
- **greetingCard** `object` — Intro card
- **questions** `object[]` — Questions as stored. Each carries a Mongo `_id`, and so does every entry in its `options`.
- **questionPageHeadline** `string` — Headline above the questions
- **privacyPolicyLink** `string` — Privacy policy URL
- **privacyPolicyText** `string` — Privacy policy link text
- **customDisclaimer** `object` — Custom disclaimer block
- **thankYouPage** `object` — Confirmation screen

```json
{
  "id": "6a866661867e604d24f5a21c",
  "isDraft": true,
  "name": "Untitled form 20 Aug 26, 07:57 AM",
  "locationId": "fRMewNQIxSyZ5R4nQyit",
  "pageId": "196684453527082",
  "type": "MORE_VOLUME",
  "locale": "EN_US",
  "createdAt": "2026-08-20T02:28:49.477Z",
  "updatedAt": "2026-08-20T02:28:49.477Z",
  "greetingCard": {
    "title": "Hi there, good to see you here!",
    "style": "LIST_STYLE",
    "content": [
      "Ready to learn more? Just a few quick details in the form below."
    ],
    "_id": "6a7d9fa9d4e1daea36a9585f"
  },
  "questions": [
    {
      "key": "full_name",
      "type": "FULL_NAME",
      "label": "What is your name?",
      "options": [
        {
          "key": "Option 1",
          "value": "Option 1"
        }
      ],
      "_id": "6a7d9fa9d4e1daea36a95860"
    }
  ],
  "questionPageHeadline": "We'll use your information to send you our weekly newsletters.",
  "privacyPolicyLink": "https://www.privacypolicy.com",
  "privacyPolicyText": "Link text",
  "customDisclaimer": {
    "title": "Terms and conditions",
    "body": "By submitting you agree to our terms.",
    "checkboxes": [
      {
        "key": "consent_marketing",
        "text": "I agree to receive marketing emails",
        "isRequired": true
      }
    ]
  },
  "thankYouPage": {
    "title": "Thank you, you are all set!",
    "body": "You can visit our website or call us.",
    "buttonText": "View website",
    "buttonType": "VIEW_WEBSITE",
    "buttonLink": "",
    "businessPhone": "5551234567",
    "countryCode": "+1"
  }
}
```

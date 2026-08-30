---
title: "Create lead form"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/li-create-lead-form"
seccion: "Ad Manager > LinkedIn Ads > Create lead form"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/ad-publishing/linkedin/:accountId/form"
---

# Create lead form

```http
POST /ad-publishing/linkedin/:accountId/form
```

Create a new LinkedIn lead gen form for an ad account

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` _required_ — Location identifier

### Request body (application/json)

**Body required**

- **owner** `object` _required_ — Form owner
- **creationLocale** `object` _required_ — Creation locale
- **name** `string` _required_ — Form name
- **state** `string` _required_ — Form state
  - Available options: `PUBLISHED`
- **content** `object` _required_ — Form content
- **hiddenFields** `object[]` — Hidden fields

```json
{
  "owner": {
    "sponsoredAccount": "urn:li:sponsoredAccount:123456"
  },
  "creationLocale": {
    "country": "US",
    "language": "en"
  },
  "name": "Contact Us",
  "state": "PUBLISHED",
  "content": {
    "questions": [],
    "headline": {
      "localized": {
        "en_US": "Get in touch"
      }
    },
    "postSubmissionInfo": {},
    "legalInfo": {}
  },
  "hiddenFields": [
    {
      "name": "utm_source",
      "value": "linkedin"
    }
  ]
}
```

### Response (200 · application/json)

The created lead form. Same shape as a list entry, minus `reviewInfo` until LinkedIn reviews it.

**Schema**

- **id** `number` — Form id. Returned as a number.
- **name** `string` — Form name
- **state** `string` — Form lifecycle state
- **versionId** `number` — Version of the form definition
- **created** `number` — When the form was created, epoch milliseconds
- **lastModified** `number` — When the form was last modified, epoch milliseconds
- **creationLocale** `object` — Locale the form was authored in
- **owner** `object` — Account that owns the form
- **reviewInfo** `object` — LinkedIn review outcome. Absent on a form that has just been created and not yet reviewed; present on reads.
- **hiddenFields** `object[]` — Hidden fields submitted alongside the lead. Empty array when none.
- **content** `object` — Form definition

```json
{
  "id": 1025914010,
  "name": "Q3 demand generation form",
  "state": "PUBLISHED",
  "versionId": 1,
  "created": 1787056838757,
  "lastModified": 1787057842322,
  "creationLocale": {
    "country": "US",
    "language": "en"
  },
  "owner": {
    "sponsoredAccount": "urn:li:sponsoredAccount:556129919"
  },
  "reviewInfo": {
    "reviewStatus": "REJECTED",
    "rejectionReasons": [
      "MISSING_PRIVACY_POLICY",
      "NONFUNCTIONAL_SITE"
    ],
    "lastUpdated": 1787057842315
  },
  "hiddenFields": [
    {
      "name": "utm_source",
      "value": "linkedin"
    }
  ],
  "content": {
    "headline": {
      "localized": {
        "en_US": "Hi there, good to see you here!"
      }
    },
    "description": {
      "localized": {
        "en_US": "Hi there, good to see you here!"
      }
    },
    "questions": [
      {
        "questionId": 20711780444,
        "question": {
          "localized": {
            "en_US": "Hi there, good to see you here!"
          }
        },
        "name": "lastName",
        "label": "Last name",
        "responseRequired": true,
        "responseEditable": true,
        "predefinedField": "LAST_NAME",
        "questionDetails": {
          "textQuestionDetails": {
            "maxResponseLength": 300
          },
          "multipleChoiceQuestionDetails": {
            "options": [
              {
                "id": 0,
                "label": "Option 1",
                "text": {
                  "localized": {
                    "en_US": "Hi there, good to see you here!"
                  }
                }
              }
            ]
          }
        }
      }
    ],
    "postSubmissionInfo": {
      "message": {
        "localized": {
          "en_US": "Hi there, good to see you here!"
        }
      },
      "callToAction": {
        "callToActionLabel": "VISIT_COMPANY_WEBSITE",
        "callToActionTarget": {
          "landingPageUrl": "https://example.com"
        }
      }
    },
    "legalInfo": {
      "legalInfoId": 2873998916,
      "privacyPolicyUrl": "https://example.com/privacy",
      "consents": [
        {
          "id": 1,
          "label": "I agree to be contacted",
          "checkRequired": true,
          "consent": {
            "localized": {
              "en_US": "Hi there, good to see you here!"
            }
          }
        }
      ],
      "legalDisclaimer": {
        "localized": {
          "en_US": "Hi there, good to see you here!"
        }
      }
    }
  }
}
```

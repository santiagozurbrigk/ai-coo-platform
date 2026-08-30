---
title: "Hyros Webhooks — referencia"
source: "https://api-docs.hyros.com/ai-context/webhooks.txt"
generado_desde: "openapi/webhooks.yaml"
capturado: "2026-08-30"
---

# Hyros Webhooks — referencia

Eventos salientes de Hyros hacia un endpoint propio.

- Versión declarada: `1.1`
- Spec original: [`./openapi/webhooks.yaml`](./openapi/webhooks.yaml)

## Descripción del proveedor

The Hyros Webhooks system allows you to subscribe to different events that occur on the platform
and receive data associated with those events at a target URL configured in your subscriptions.

## Failure Handling

When an increase in errors is detected while sending events, a notification will be sent to your
Hyros account. If the problem is not addressed, the subscription will be automatically disabled.
You can re-enable it once the issue is resolved.

## Events

| Event | Description |
|-------|-------------|
| `sale.attributed` | A sale is attributed to a lead |
| `sale.refunded` | A sale is refunded |
| `lead.opted.in` | A lead opts in |
| `lead.origin.assigned` | A lead is assigned as the origin of another lead |
| `lead.stage.changed` | A lead's current stage changes |
| `lead.tag.added` | One or more tags are added to a lead |
| `lead.tag.removed` | One or more tags are removed from a lead |
| `call.attributed` | A call is attributed to a lead |
| `subscription.created` | A subscription is created (first indexed) |
| `subscription.status.changed` | A subscription's status changes |

## Deduplication

Each event includes an `eventId` field that can be used for deduplication on your end.

## Verifying Webhook Signatures

Every webhook request is signed so your endpoint can verify that the payload actually came from Hyros.

Each **POST** request includes two signature headers, both computed with your subscription's `secretKey`:

| Header | Description |
|--------|-------------|
| `X-Hyros-Signature` | **Recommended.** Format `t=<timestamp>,v1=<signature>`, where `<timestamp>` is the Unix epoch time (in seconds) at which the request was sent, and `<signature>` is the lowercase hex-encoded HMAC-SHA256 of the string `<timestamp>.<payload>` (the timestamp, a dot, and the full raw request body). |
| `X-Hyros-Hmac-Sha1` | **Deprecated**, use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 of the raw JSON value of the event's `body` field only. Still sent on every request so existing integrations keep working. |

The `secretKey` is returned **once**, in the response of the create subscription request —
store it securely. You can also find it in the Hyros app under
**Settings → Integrations → Hyros Webhook Subscription**; it is never returned again by the API.

To verify a request with `X-Hyros-Signature`:

1. Split the header on `,` and extract the `t=` and `v1=` values.
2. Concatenate the `t` value, a `.` character, and the raw request body, exactly as received
   (do not re-serialize or pretty-print it).
3. Compute the HMAC-SHA256 of that string using your subscription's `secretKey` as the key.
4. Hex-encode the result (lowercase) and compare it to the `v1` value using a constant-time comparison.
5. Optionally, reject the request if `t` is too far from the current time (for example, more than
   5 minutes) to protect against replay attacks. Retried deliveries are re-signed, so each attempt
   carries a fresh timestamp.

Example (Node.js):

```javascript
const crypto = require("crypto");

function verifyHyrosSignature(rawRequestBody, signatureHeader, secretKey, toleranceSeconds = 300) {
    const match = /^t=(\d+),v1=([0-9a-f]{64})$/.exec(signatureHeader || "");
    if (!match) return false;
    const [, timestamp, signature] = match;

    if (Math.abs(Date.now() / 1000 - Number(timestamp)) > toleranceSeconds) return false;

    const expected = crypto.createHmac("sha256", secretKey)
        .update(`${timestamp}.${rawRequestBody}`)
        .digest("hex");

    const received = Buffer.from(signature, "utf8");
    const computed = Buffer.from(expected, "utf8");
    return received.length === computed.length && crypto.timingSafeEqual(received, computed);
}
```

If your integration still verifies the deprecated `X-Hyros-Hmac-Sha1` header: extract the raw JSON
value of the `body` field from the request payload exactly as received (`body` is the last field of
the payload — do not re-serialize it), compute the HMAC-SHA1 of that string with your `secretKey`,
hex-encode it (lowercase) and compare it to the header value using a constant-time comparison.
Plan to migrate to `X-Hyros-Signature`.

If the signature does not match, discard the request.

## Eventos de webhook

| Evento | Método | Qué lo dispara |
| --- | --- | --- |
| `call.attributed` | `POST` | Call Attributed |
| `lead.opted.in` | `POST` | Lead Opted In |
| `lead.origin.assigned` | `POST` | Lead Origin Assigned |
| `lead.stage.changed` | `POST` | Lead Stage Changed |
| `lead.tag.added` | `POST` | Lead Tag Added |
| `lead.tag.removed` | `POST` | Lead Tag Removed |
| `sale.attributed` | `POST` | Sale Attributed |
| `sale.refunded` | `POST` | Sale Refunded |
| `subscription.created` | `POST` | Subscription Created |
| `subscription.status.changed` | `POST` | Subscription Status Changed |

---

## `POST call.attributed`

**Call Attributed**

Triggered when a call is attributed to a lead. The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `call.attributed`
- **body** `CallEntity`
  - **id** `string`
  - **type** `string` · valores: `CALL`
  - **date** `string` — Date of the call (user timezone).
  - **UTCDate** `string` — Date of the call (UTC).
  - **qualified** `boolean`
  - **score** `number`
  - **tag** `string`
  - **attribution** `Attribution[]`
    - `array` de:
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean` — Indicates whether the source is disregarded.
      - **organic** `boolean` — Indicates whether the source is organic.
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **clickDate** `string` — Date of the first tracked click.
      - **UTCClickDate** `string` — Date of the first tracked click in UTC.
      - **adSource** `AdSource`
        - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
        - **adAccountId** `string` — ID of the ad account.
        - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string` — Name of the ad.
        - **adSourceId** `string` — ID of the ad in the Ads Manager.
  - **lead** `Lead`
    - **email** `string`
    - **joinDate** `string`
    - **UTCJoinDate** `string`
    - **ips** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **firstName** `string`
    - **lastName** `string`

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-f254e3ec91df4aa2a9845b709bf33885",
  "type": "call.attributed",
  "timestamp": "2022-09-28T15:41:56-03:00",
  "body": {
    "id": "cll-d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35",
    "type": "CALL",
    "date": "2022-09-28T15:41:33-03:00",
    "UTCDate": "2022-09-28T15:41:33-03:00",
    "qualified": true,
    "score": 1.0,
    "tag": "$call",
    "attribution": [
      {
        "sourceLinkId": "b1f47517c3cae033d98c7cdc34709f743dbdf622bab9137ae3d12f723ae9faba",
        "name": "Sl1",
        "tag": "@sl1",
        "disregarded": false,
        "organic": false,
        "trafficSource": {
          "id": "cat-5b8d6c9793ffa110725a9c9093514668",
          "name": "automatic"
        },
        "goal": {
          "id": "cat-290631a916115729cd9fe08cee0efc84",
          "name": "all"
        },
        "category": {
          "id": "cat-b6faae8ed01c3ca86e0d31b4b1292e40",
          "name": "automatic"
        }
      }
    ],
    "lead": {
      "email": "lead2@gmail.com",
      "joinDate": "2022-09-28T14:55:25-03:00",
      "UTCJoinDate": "2022-09-28T14:55:25-03:00",
      "firstName": "Jhon",
      "lastName": "Doe",
      "ips": [
        "0.0.0.0"
      ],
      "tags": [
        "!clicked",
        "@sl1",
        "$product1",
        "$call"
      ],
      "phoneNumbers": [
        "15712253066"
      ]
    }
  }
}
```

### Respuestas

**`200`** — Event received successfully.

---

## `POST lead.opted.in`

**Lead Opted In**

Triggered when a lead opts in. The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `lead.opted.in`
- **body** `LeadOptInEntity`
  - **id** `string`
  - **firstOptin** `boolean` — Identifies whether it is the first opt-in for that lead.
  - **date** `string` — Date the lead opted in (user timezone).
  - **UTCDate** `string` — Date the lead opted in (UTC).
  - **referrerUrl** `string` — Referrer URL from which the lead opted in.
  - **lead** `Lead`
    - **email** `string`
    - **joinDate** `string`
    - **UTCJoinDate** `string`
    - **ips** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **firstName** `string`
    - **lastName** `string`
  - **attribution** `Attribution[]` — All attributions the lead has.
    - `array` de:
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean` — Indicates whether the source is disregarded.
      - **organic** `boolean` — Indicates whether the source is organic.
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **clickDate** `string` — Date of the first tracked click.
      - **UTCClickDate** `string` — Date of the first tracked click in UTC.
      - **adSource** `AdSource`
        - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
        - **adAccountId** `string` — ID of the ad account.
        - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string` — Name of the ad.
        - **adSourceId** `string` — ID of the ad in the Ads Manager.
  - **firstSource** `Attribution`
    - **sourceLinkId** `string`
    - **name** `string`
    - **tag** `string`
    - **disregarded** `boolean` — Indicates whether the source is disregarded.
    - **organic** `boolean` — Indicates whether the source is organic.
    - **trafficSource** `TrafficSource`
      - **id** `string`
      - **name** `string`
    - **goal** `Goal`
      - **id** `string`
      - **name** `string`
    - **category** `Category`
      - **id** `string`
      - **name** `string`
    - **clickDate** `string` — Date of the first tracked click.
    - **UTCClickDate** `string` — Date of the first tracked click in UTC.
    - **adSource** `AdSource`
      - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
      - **adAccountId** `string` — ID of the ad account.
      - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
    - **sourceLinkAd** `SourceLinkAd`
      - **name** `string` — Name of the ad.
      - **adSourceId** `string` — ID of the ad in the Ads Manager.
  - **lastSource** `Attribution`
    - **sourceLinkId** `string`
    - **name** `string`
    - **tag** `string`
    - **disregarded** `boolean` — Indicates whether the source is disregarded.
    - **organic** `boolean` — Indicates whether the source is organic.
    - **trafficSource** `TrafficSource`
      - **id** `string`
      - **name** `string`
    - **goal** `Goal`
      - **id** `string`
      - **name** `string`
    - **category** `Category`
      - **id** `string`
      - **name** `string`
    - **clickDate** `string` — Date of the first tracked click.
    - **UTCClickDate** `string` — Date of the first tracked click in UTC.
    - **adSource** `AdSource`
      - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
      - **adAccountId** `string` — ID of the ad account.
      - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
    - **sourceLinkAd** `SourceLinkAd`
      - **name** `string` — Name of the ad.
      - **adSourceId** `string` — ID of the ad in the Ads Manager.

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-18f9e0bd173047d7ac393e311d86b101",
  "type": "lead.opted.in",
  "timestamp": "2022-09-29T13:27:25-03:00",
  "body": {
    "id": "opt-671e1e19dc96e091ffdf676a71131b48bebec097116223e46544739bb63150cc",
    "firstOptin": true,
    "date": "2022-09-29T13:26:55-03:00",
    "UTCDate": "2022-09-29T13:26:55-03:00",
    "referrerUrl": "https://ui-test.hyros.com/public/playground?h=HR3fShIOaMpcalsj&fbc_id=23843648148170185&h_ad_id=23843735552790185",
    "lead": {
      "email": "optin@gmail.com",
      "joinDate": "2022-09-29T13:26:55-03:00",
      "UTCJoinDate": "2022-09-29T13:26:55-03:00",
      "firstName": "Jhon",
      "lastName": "Doe",
      "ips": [
        "0.0.0.0"
      ],
      "tags": [
        "!clicked",
        "@testing"
      ],
      "phoneNumbers": [
        "15712253066"
      ]
    },
    "attribution": [
      {
        "sourceLinkId": "slk-9b932b463322959108d6d7b946d4d7032c141f24e9f153b2086ec25edeffa277",
        "name": "testing",
        "tag": "@testing",
        "disregarded": false,
        "organic": false,
        "clickDate": "2022-09-29T13:26:50-03:00",
        "UTCClickDate": "2022-09-29T13:26:50-03:00",
        "trafficSource": {
          "id": "cat-506268bd2cd2f3b1b9761626c9453e73",
          "name": "facebook"
        },
        "goal": {
          "id": "cat-290631a916115729cd9fe08cee0efc84",
          "name": "all"
        },
        "category": {
          "id": "cat-d4edaa633d955a45ab6368de5a0ad7a1",
          "name": "market hero test campaign edited 2"
        },
        "adSource": {
          "adSourceId": "23843648148170185",
          "adAccountId": "887874684917521",
          "platform": "FACEBOOK"
        },
        "sourceLinkAd": {
          "name": "Facebook Attribution Test",
          "adSourceId": "23843735552790185"
        }
      }
    ],
    "firstSource": {
      "sourceLinkId": "slk-9b932b463322959108d6d7b946d4d7032c141f24e9f153b2086ec25edeffa277",
      "name": "firstSource",
      "tag": "@firstSource",
      "disregarded": false,
      "organic": false
    },
    "lastSource": {
      "sourceLinkId": "slk-9b932b463322959108d6d7b946d4d7032c141f24e9f153b2086ec25edeffa277",
      "name": "lastSource",
      "tag": "@lastSource",
      "disregarded": false,
      "organic": false
    }
  }
}
```

### Respuestas

**`200`** — Event received successfully.

---

## `POST lead.origin.assigned`

**Lead Origin Assigned**

Triggered when a lead is assigned as the origin of another lead. The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `lead.origin.assigned`
- **body** `LeadOriginAssignedEntity`
  - **mechanism** `string` — Mechanism by which the lead was assigned as origin. · valores: `SESSION_ID`, `PHONE_NUMBER`, `IP`, `MANUAL`
  - **lead** `LeadChild` — Information of the lead assigned as a child.
    - **email** `string`
    - **joinDate** `string`
    - **UTCJoinDate** `string`
  - **originLead** `Lead` — Information of the lead assigned as origin.
    - **email** `string`
    - **joinDate** `string`
    - **UTCJoinDate** `string`
    - **ips** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **firstName** `string`
    - **lastName** `string`
  - **date** `string` — Time of the origin lead assignment (user timezone).
  - **UTCDate** `string` — Time of the origin lead assignment (UTC).
  - **matchingValues** `string[]` — Values for which the two leads were matched.
    - `array` de:

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-39ff6b3f9a694d619d0d8dd9193823f9",
  "type": "lead.origin.assigned",
  "timestamp": "2022-09-29T15:19:24-03:00",
  "body": {
    "mechanism": "SESSION_ID",
    "lead": {
      "email": "optinchild@gmail.com",
      "firstName": "Jhon",
      "lastName": "Doe",
      "joinDate": "2022-09-29T15:19:23-03:00",
      "UTCJoinDate": "2022-09-29T15:19:23-03:00"
    },
    "originLead": {
      "email": "optin@gmail.com",
      "joinDate": "2022-09-29T13:26:55-03:00",
      "UTCJoinDate": "2022-09-29T13:26:55-03:00",
      "ips": [
        "0.0.0.0"
      ],
      "tags": [
        "!clicked",
        "@testing"
      ],
      "phoneNumbers": [
        "15712253066"
      ]
    },
    "date": "2022-09-29T15:19:23-03:00",
    "UTCDate": "2022-09-29T15:19:23-03:00",
    "matchingValues": [
      "HB-ET_cddf7af17ac0ea753d474bba20af5bb3485a0ee938cdf9d3f55a62d5f1b84f16"
    ]
  }
}
```

### Respuestas

**`200`** — Event received successfully.

---

## `POST lead.stage.changed`

**Lead Stage Changed**

Triggered when a lead's **current** stage changes (for example moving from `MQL` to `SQL`). The event is only emitted when the applied stage becomes the lead's current stage — a stage applied with a date older than the lead's current stage (e.g. imports or backfilled orders) does not trigger it. `fromStage` is omitted when it is the first stage ever applied to the lead. The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `lead.stage.changed`
- **body** `LeadStageChangeEntity`
  - **lead** `Lead` — Information of the lead whose stage changed.
    - **email** `string`
    - **joinDate** `string`
    - **UTCJoinDate** `string`
    - **ips** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **firstName** `string`
    - **lastName** `string`
  - **fromStage** `string` — Name of the lead's previous stage. Omitted when this is the first stage ever applied to the lead.
  - **toStage** `string` — Name of the lead's new current stage.
  - **date** `string` — Time at which the stage was applied, in the account's time zone.
  - **UTCDate** `string` — Time at which the stage was applied, in UTC.

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-39ff6b3f9a694d619d0d8dd9193823f9",
  "type": "lead.stage.changed",
  "timestamp": "2022-09-29T15:19:24-03:00",
  "body": {
    "lead": {
      "email": "example@domain.com",
      "firstName": "Jerry",
      "lastName": "Howe",
      "joinDate": "2022-09-29T15:19:23-03:00",
      "UTCJoinDate": "2022-09-29T15:19:23-03:00",
      "tags": [
        "vip",
        "newsletter"
      ]
    },
    "fromStage": "MQL",
    "toStage": "SQL",
    "date": "2022-09-29T15:19:23-03:00",
    "UTCDate": "2022-09-29T18:19:23-00:00"
  }
}
```

### Respuestas

**`200`** — Event received successfully.

---

## `POST lead.tag.added`

**Lead Tag Added**

Triggered when one or more tags are added to a lead. `body.tags` contains only the tags that were added; `body.lead.tags` is the lead's full tag list after the change. The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `lead.tag.added`
- **body** `LeadTagChangeEntity`
  - **lead** `Lead` — Full lead snapshot after the change.
    - **email** `string`
    - **joinDate** `string`
    - **UTCJoinDate** `string`
    - **ips** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **firstName** `string`
    - **lastName** `string`
  - **tags** `string[]` — Only the tag names that changed (added or removed, depending on the event). Capped at the last 30 tags.
    - `array` de:
  - **action** `string` — Whether the tags were added or removed. · valores: `ADDED`, `REMOVED`
  - **date** `string` — Time of the change in the account's time zone.
  - **UTCDate** `string` — Time of the change in UTC.

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-39ff6b3f9a694d619d0d8dd9193823f9",
  "type": "lead.tag.added",
  "timestamp": "2022-09-29T15:19:24-03:00",
  "body": {
    "lead": {
      "email": "example@domain.com",
      "firstName": "Jerry",
      "lastName": "Howe",
      "joinDate": "2022-09-29T15:19:23-03:00",
      "UTCJoinDate": "2022-09-29T15:19:23-03:00",
      "tags": [
        "vip",
        "newsletter"
      ]
    },
    "tags": [
      "vip"
    ],
    "action": "ADDED",
    "date": "2022-09-29T15:19:23-03:00",
    "UTCDate": "2022-09-29T15:19:23-03:00"
  }
}
```

### Respuestas

**`200`** — Event received successfully.

---

## `POST lead.tag.removed`

**Lead Tag Removed**

Triggered when one or more tags are removed from a lead. `body.tags` contains only the tags that were removed; `body.lead.tags` is the lead's full tag list after the change (with the removed tags already excluded). The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `lead.tag.removed`
- **body** `LeadTagChangeEntity`
  - **lead** `Lead` — Full lead snapshot after the change.
    - **email** `string`
    - **joinDate** `string`
    - **UTCJoinDate** `string`
    - **ips** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **firstName** `string`
    - **lastName** `string`
  - **tags** `string[]` — Only the tag names that changed (added or removed, depending on the event). Capped at the last 30 tags.
    - `array` de:
  - **action** `string` — Whether the tags were added or removed. · valores: `ADDED`, `REMOVED`
  - **date** `string` — Time of the change in the account's time zone.
  - **UTCDate** `string` — Time of the change in UTC.

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-39ff6b3f9a694d619d0d8dd9193823f9",
  "type": "lead.tag.removed",
  "timestamp": "2022-09-29T15:19:24-03:00",
  "body": {
    "lead": {
      "email": "example@domain.com",
      "firstName": "Jerry",
      "lastName": "Howe",
      "joinDate": "2022-09-29T15:19:23-03:00",
      "UTCJoinDate": "2022-09-29T15:19:23-03:00",
      "tags": [
        "newsletter"
      ]
    },
    "tags": [
      "vip"
    ],
    "action": "REMOVED",
    "date": "2022-09-29T15:19:23-03:00",
    "UTCDate": "2022-09-29T15:19:23-03:00"
  }
}
```

### Respuestas

**`200`** — Event received successfully.

---

## `POST sale.attributed`

**Sale Attributed**

Triggered when a sale is attributed to a lead. The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `sale.attributed`
- **body** `SaleEntity`
  - **id** `string`
  - **type** `string` · valores: `SALE`
  - **date** `string` — Date of the sale in the user's timezone.
  - **UTCDate** `string` — Date of the sale in UTC.
  - **qualified** `boolean` — True if the sale score is 1.
  - **score** `number`
  - **orderId** `string`
  - **recurring** `boolean`
  - **attribution** `Attribution[]`
    - `array` de:
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean` — Indicates whether the source is disregarded.
      - **organic** `boolean` — Indicates whether the source is organic.
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **clickDate** `string` — Date of the first tracked click.
      - **UTCClickDate** `string` — Date of the first tracked click in UTC.
      - **adSource** `AdSource`
        - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
        - **adAccountId** `string` — ID of the ad account.
        - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string` — Name of the ad.
        - **adSourceId** `string` — ID of the ad in the Ads Manager.
  - **lead** `Lead`
    - **email** `string`
    - **joinDate** `string`
    - **UTCJoinDate** `string`
    - **ips** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **firstName** `string`
    - **lastName** `string`
  - **product** `Product`
    - **id** `string`
    - **quantity** `number`
    - **name** `string`
    - **tag** `string`
    - **category** `Category`
      - **id** `string`
      - **name** `string`
    - **price** `Price` — Price in the outbound currency configured in Hyros.
      - **price** `number`
      - **discount** `number`
      - **hardCost** `number`
      - **refunded** `number`
      - **currency** `string` — Outbound currency configured in Hyros (default USD).
    - **USDPrice** `Price` — Price in USD.
      - **price** `number`
      - **discount** `number`
      - **hardCost** `number`
      - **refunded** `number`
      - **currency** `string` — Outbound currency configured in Hyros (default USD).

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-d7ef9cb559654632af736c9992cdc17a",
  "type": "sale.attributed",
  "timestamp": "2022-09-28T15:38:48-03:00",
  "body": {
    "id": "sle-6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    "type": "SALE",
    "date": "2022-09-28T15:38:24-03:00",
    "UTCDate": "2022-09-28T15:38:24-03:00",
    "qualified": true,
    "score": 1.0,
    "orderId": "a659f6a6ad024164851b0bfbf363c436",
    "recurring": false,
    "attribution": [
      {
        "sourceLinkId": "b1f47517c3cae033d98c7cdc34709f743dbdf622bab9137ae3d12f723ae9faba",
        "name": "Sl1",
        "tag": "@sl1",
        "clickDate": "2022-09-28T15:38:24-03:00",
        "disregarded": false,
        "organic": false,
        "trafficSource": {
          "id": "cat-5b8d6c9793ffa110725a9c9093514668",
          "name": "automatic"
        },
        "goal": {
          "id": "cat-290631a916115729cd9fe08cee0efc84",
          "name": "all"
        },
        "category": {
          "id": "cat-b6faae8ed01c3ca86e0d31b4b1292e40",
          "name": "automatic"
        }
      }
    ],
    "lead": {
      "email": "lead2@gmail.com",
      "joinDate": "2022-09-28T14:55:25-03:00",
      "UTCJoinDate": "2022-09-28T14:55:25-03:00",
      "firstName": "Jhon",
      "lastName": "Doe",
      "ips": [
        "0.0.0.0"
      ],
      "tags": [
        "!clicked",
        "@sl1",
        "$product1"
      ],
      "phoneNumbers": [
        "15712253066"
      ]
    },
    "product": {
      "id": "pdt-2499a46c7806509b9c843ad8248bdfd2",
      "quantity": 1,
      "name": "product1",
      "tag": "$product1",
      "category": {
        "id": "cat-ac78d25c92950a16199b5fc86ad86737",
        "name": "No Category"
      },
      "price": {
        "price": 150.0,
        "discount": 0,
        "hardCost": 0,
        "refunded": 0.0,
        "currency": "USD"
      },
      "USDPrice": {
        "price": 150.0,
        "discount": 0,
        "hardCost": 0,
        "refunded": 0.0,
        "currency": "USD"
      }
    }
  }
}
```

### Respuestas

**`200`** — Event received successfully.

---

## `POST sale.refunded`

**Sale Refunded**

Triggered when a sale is refunded. Carries the same sale body as `sale.attributed`, plus `refundedDate`; the refunded amount is available in `product.price.refunded` (and `product.USDPrice.refunded`). The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `sale.refunded`
- **body** `SaleRefundedEntity`
  - **id** `string`
  - **type** `string` · valores: `SALE`
  - **date** `string` — Date of the sale in the user's timezone.
  - **UTCDate** `string` — Date of the sale in UTC.
  - **qualified** `boolean` — True if the sale score is 1.
  - **score** `number`
  - **orderId** `string`
  - **recurring** `boolean`
  - **attribution** `Attribution[]`
    - `array` de:
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean` — Indicates whether the source is disregarded.
      - **organic** `boolean` — Indicates whether the source is organic.
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **clickDate** `string` — Date of the first tracked click.
      - **UTCClickDate** `string` — Date of the first tracked click in UTC.
      - **adSource** `AdSource`
        - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
        - **adAccountId** `string` — ID of the ad account.
        - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string` — Name of the ad.
        - **adSourceId** `string` — ID of the ad in the Ads Manager.
  - **lead** `Lead`
    - **email** `string`
    - **joinDate** `string`
    - **UTCJoinDate** `string`
    - **ips** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **firstName** `string`
    - **lastName** `string`
  - **product** `Product`
    - **id** `string`
    - **quantity** `number`
    - **name** `string`
    - **tag** `string`
    - **category** `Category`
      - **id** `string`
      - **name** `string`
    - **price** `Price` — Price in the outbound currency configured in Hyros.
      - **price** `number`
      - **discount** `number`
      - **hardCost** `number`
      - **refunded** `number`
      - **currency** `string` — Outbound currency configured in Hyros (default USD).
    - **USDPrice** `Price` — Price in USD.
      - **price** `number`
      - **discount** `number`
      - **hardCost** `number`
      - **refunded** `number`
      - **currency** `string` — Outbound currency configured in Hyros (default USD).
  - **refundedDate** `string` — Date the sale was refunded. The refunded amount is available in `product.price.refunded` (and `product.USDPrice.refunded`).

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-d7ef9cb559654632af736c9992cdc17a",
  "type": "sale.refunded",
  "timestamp": "2022-09-29T10:12:05-03:00",
  "body": {
    "id": "sle-6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",
    "type": "SALE",
    "date": "2022-09-28T15:38:24-03:00",
    "UTCDate": "2022-09-28T15:38:24-03:00",
    "qualified": true,
    "score": 1.0,
    "orderId": "a659f6a6ad024164851b0bfbf363c436",
    "recurring": false,
    "refundedDate": "2022-09-29T10:12:05-03:00",
    "attribution": [
      {
        "sourceLinkId": "b1f47517c3cae033d98c7cdc34709f743dbdf622bab9137ae3d12f723ae9faba",
        "name": "Sl1",
        "tag": "@sl1",
        "clickDate": "2022-09-28T15:38:24-03:00",
        "disregarded": false,
        "organic": false,
        "trafficSource": {
          "id": "cat-5b8d6c9793ffa110725a9c9093514668",
          "name": "automatic"
        },
        "goal": {
          "id": "cat-290631a916115729cd9fe08cee0efc84",
          "name": "all"
        },
        "category": {
          "id": "cat-b6faae8ed01c3ca86e0d31b4b1292e40",
          "name": "automatic"
        }
      }
    ],
    "lead": {
      "email": "lead2@gmail.com",
      "joinDate": "2022-09-28T14:55:25-03:00",
      "UTCJoinDate": "2022-09-28T14:55:25-03:00",
      "firstName": "Jhon",
      "lastName": "Doe",
      "ips": [
        "0.0.0.0"
      ],
      "tags": [
        "!clicked",
        "@sl1",
        "$product1"
      ],
      "phoneNumbers": [
        "15712253066"
      ]
    },
    "product": {
      "id": "pdt-2499a46c7806509b9c843ad8248bdfd2",
      "quantity": 1,
      "name": "product1",
      "tag": "$product1",
      "category": {
        "id": "cat-ac78d25c92950a16199b5fc86ad86737",
        "name": "No Category"
      },
      "price": {
        "price": 150.0,
        "discount": 0,
        "hardCost": 0,
        "refunded": 150.0,
        "currency": "USD"
      },
      "USDPrice": {
        "price": 150.0,
        "discount": 0,
        "hardCost": 0,
        "refunded": 150.0,
        "currency": "USD"
      }
    }
  }
}
```

### Respuestas

**`200`** — Event received successfully.

---

## `POST subscription.created`

**Subscription Created**

Triggered the first time a subscription is indexed. The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `subscription.created`
- **body** `SubscriptionEntity`
  - **id** `string` — ID of the subscription.
  - **status** `SubscriptionStatus` · valores: `ACTIVE`, `TRIALING`, `CANCELED`, `PAST_DUE`, `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `UNPAID`, `COMPLETED`, `PAUSED`, `UNKNOWN`
  - **name** `string`
  - **tag** `string`
  - **planId** `string`
  - **price** `number`
  - **periodicity** `BillingPeriodType` · valores: `DAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR`
  - **startDate** `string` — Start date of the subscription. May be `null`.
  - **endDate** `string`
  - **cancelAtDate** `string`
  - **trialStartDate** `string`
  - **trialEndDate** `string`
  - **lead** `SubscriptionLead` — Lead associated with the subscription. May be `null`.
    - **id** `string`
    - **email** `string`
    - **creationDate** `string` — Date the lead was created.
    - **firstName** `string`
    - **lastName** `string`
    - **ips** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **provider** `Provider`
      - **id** `string`
      - **integration** `Integration`
        - **id** `string`
        - **name** `string`
        - **type** `string` — Name of the external integration type (e.g. `STRIPE`, `PAYPAL`, `SHOPIFY`).
  - **firstSource** `Attribution`
    - **sourceLinkId** `string`
    - **name** `string`
    - **tag** `string`
    - **disregarded** `boolean` — Indicates whether the source is disregarded.
    - **organic** `boolean` — Indicates whether the source is organic.
    - **trafficSource** `TrafficSource`
      - **id** `string`
      - **name** `string`
    - **goal** `Goal`
      - **id** `string`
      - **name** `string`
    - **category** `Category`
      - **id** `string`
      - **name** `string`
    - **clickDate** `string` — Date of the first tracked click.
    - **UTCClickDate** `string` — Date of the first tracked click in UTC.
    - **adSource** `AdSource`
      - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
      - **adAccountId** `string` — ID of the ad account.
      - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
    - **sourceLinkAd** `SourceLinkAd`
      - **name** `string` — Name of the ad.
      - **adSourceId** `string` — ID of the ad in the Ads Manager.
  - **lastSource** `Attribution`
    - **sourceLinkId** `string`
    - **name** `string`
    - **tag** `string`
    - **disregarded** `boolean` — Indicates whether the source is disregarded.
    - **organic** `boolean` — Indicates whether the source is organic.
    - **trafficSource** `TrafficSource`
      - **id** `string`
      - **name** `string`
    - **goal** `Goal`
      - **id** `string`
      - **name** `string`
    - **category** `Category`
      - **id** `string`
      - **name** `string`
    - **clickDate** `string` — Date of the first tracked click.
    - **UTCClickDate** `string` — Date of the first tracked click in UTC.
    - **adSource** `AdSource`
      - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
      - **adAccountId** `string` — ID of the ad account.
      - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
    - **sourceLinkAd** `SourceLinkAd`
      - **name** `string` — Name of the ad.
      - **adSourceId** `string` — ID of the ad in the Ads Manager.
  - **provider** `Provider`
    - **id** `string`
    - **integration** `Integration`
      - **id** `string`
      - **name** `string`
      - **type** `string` — Name of the external integration type (e.g. `STRIPE`, `PAYPAL`, `SHOPIFY`).
  - **category** `Category`
    - **id** `string`
    - **name** `string`

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-a1b2c3d4e5f6470897a1b2c3d4e5f608",
  "type": "subscription.created",
  "timestamp": "2024-11-17T10:51:54-03:00",
  "body": {
    "id": "7016953413",
    "status": "ACTIVE",
    "name": "Pro Plan",
    "tag": "$pro-plan",
    "planId": "plan_pro",
    "price": 49.99,
    "periodicity": "MONTH",
    "startDate": "Thu Nov 17 10:51:54 ART 2024",
    "endDate": null,
    "cancelAtDate": null,
    "trialStartDate": null,
    "trialEndDate": null,
    "lead": {
      "id": "ld-7d793037a0760186574b0282f2f435e7",
      "email": "john@doe.com",
      "creationDate": "Thu Nov 17 10:51:11 ART 2024",
      "ips": [
        "201.220.21.77"
      ],
      "tags": [
        "@testing",
        "$pro-plan"
      ]
    },
    "firstSource": null,
    "lastSource": null,
    "provider": {
      "id": "7016953413",
      "integration": {
        "id": "int-2499a46c7806509b9c843ad8248bdfd2",
        "name": "Stripe",
        "type": "STRIPE"
      }
    },
    "category": null
  }
}
```

### Respuestas

**`200`** — Event received successfully.

---

## `POST subscription.status.changed`

**Subscription Status Changed**

Triggered when the status of an indexed subscription changes. The payload is sent via **POST** to your configured subscription URL.

### Parámetros

- **X-Hyros-Signature** (`header`) `string` _requerido_ — Recommended verification header. Format `t=<unix epoch seconds>,v1=<signature>`, where the signature is the lowercase hex-encoded HMAC-SHA256 of `<t>.<raw request body>`, computed with your subscription's `secretKey`. Verifying `t` against the current time protects against replayed requests. See "Verifying Webhook Signatures".
- **X-Hyros-Hmac-Sha1** (`header`) `string` _requerido_ — Deprecated — use `X-Hyros-Signature` instead. Lowercase hex-encoded HMAC-SHA1 signature of the raw JSON value of the event's `body` field, computed with your subscription's `secretKey`. Still sent on every request so existing integrations keep working. See "Verifying Webhook Signatures".

### Request body — `application/json` (requerido)

- **subscriptionId** `string` _requerido_ — ID of the subscription.
- **eventId** `string` _requerido_ — ID of the event. Can be used for deduplication.
- **type** `string` _requerido_ — Type of the event.
- **timestamp** `string` _requerido_ — Timestamp when the event was sent.
- **type** `string` · valores: `subscription.status.changed`
- **body** `SubscriptionEntity`
  - **id** `string` — ID of the subscription.
  - **status** `SubscriptionStatus` · valores: `ACTIVE`, `TRIALING`, `CANCELED`, `PAST_DUE`, `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `UNPAID`, `COMPLETED`, `PAUSED`, `UNKNOWN`
  - **name** `string`
  - **tag** `string`
  - **planId** `string`
  - **price** `number`
  - **periodicity** `BillingPeriodType` · valores: `DAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR`
  - **startDate** `string` — Start date of the subscription. May be `null`.
  - **endDate** `string`
  - **cancelAtDate** `string`
  - **trialStartDate** `string`
  - **trialEndDate** `string`
  - **lead** `SubscriptionLead` — Lead associated with the subscription. May be `null`.
    - **id** `string`
    - **email** `string`
    - **creationDate** `string` — Date the lead was created.
    - **firstName** `string`
    - **lastName** `string`
    - **ips** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **tags** `string[]`
      - `array` de:
    - **provider** `Provider`
      - **id** `string`
      - **integration** `Integration`
        - **id** `string`
        - **name** `string`
        - **type** `string` — Name of the external integration type (e.g. `STRIPE`, `PAYPAL`, `SHOPIFY`).
  - **firstSource** `Attribution`
    - **sourceLinkId** `string`
    - **name** `string`
    - **tag** `string`
    - **disregarded** `boolean` — Indicates whether the source is disregarded.
    - **organic** `boolean` — Indicates whether the source is organic.
    - **trafficSource** `TrafficSource`
      - **id** `string`
      - **name** `string`
    - **goal** `Goal`
      - **id** `string`
      - **name** `string`
    - **category** `Category`
      - **id** `string`
      - **name** `string`
    - **clickDate** `string` — Date of the first tracked click.
    - **UTCClickDate** `string` — Date of the first tracked click in UTC.
    - **adSource** `AdSource`
      - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
      - **adAccountId** `string` — ID of the ad account.
      - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
    - **sourceLinkAd** `SourceLinkAd`
      - **name** `string` — Name of the ad.
      - **adSourceId** `string` — ID of the ad in the Ads Manager.
  - **lastSource** `Attribution`
    - **sourceLinkId** `string`
    - **name** `string`
    - **tag** `string`
    - **disregarded** `boolean` — Indicates whether the source is disregarded.
    - **organic** `boolean` — Indicates whether the source is organic.
    - **trafficSource** `TrafficSource`
      - **id** `string`
      - **name** `string`
    - **goal** `Goal`
      - **id** `string`
      - **name** `string`
    - **category** `Category`
      - **id** `string`
      - **name** `string`
    - **clickDate** `string` — Date of the first tracked click.
    - **UTCClickDate** `string` — Date of the first tracked click in UTC.
    - **adSource** `AdSource`
      - **adSourceId** `string` — ID of the adset/campaign/adgroup in the Ads Manager.
      - **adAccountId** `string` — ID of the ad account.
      - **platform** `string` · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`
    - **sourceLinkAd** `SourceLinkAd`
      - **name** `string` — Name of the ad.
      - **adSourceId** `string` — ID of the ad in the Ads Manager.
  - **provider** `Provider`
    - **id** `string`
    - **integration** `Integration`
      - **id** `string`
      - **name** `string`
      - **type** `string` — Name of the external integration type (e.g. `STRIPE`, `PAYPAL`, `SHOPIFY`).
  - **category** `Category`
    - **id** `string`
    - **name** `string`

```json
{
  "subscriptionId": "sub-cee5ee3f380c4d8fb1286bac9e91fc1c",
  "eventId": "evt-b2c3d4e5f6a7481908b2c3d4e5f6a719",
  "type": "subscription.status.changed",
  "timestamp": "2025-01-17T10:51:54-03:00",
  "body": {
    "id": "7016953413",
    "status": "CANCELED",
    "name": "Pro Plan",
    "tag": "$pro-plan",
    "planId": "plan_pro",
    "price": 49.99,
    "periodicity": "MONTH",
    "startDate": "Thu Nov 17 10:51:54 ART 2024",
    "endDate": "Fri Jan 17 10:51:54 ART 2025",
    "cancelAtDate": "Fri Jan 17 10:51:54 ART 2025",
    "trialStartDate": null,
    "trialEndDate": null,
    "lead": {
      "id": "ld-7d793037a0760186574b0282f2f435e7",
      "email": "john@doe.com",
      "creationDate": "Thu Nov 17 10:51:11 ART 2024",
      "ips": [
        "201.220.21.77"
      ],
      "tags": [
        "@testing",
        "$pro-plan"
      ]
    },
    "firstSource": null,
    "lastSource": null,
    "provider": {
      "id": "7016953413",
      "integration": {
        "id": "int-2499a46c7806509b9c843ad8248bdfd2",
        "name": "Stripe",
        "type": "STRIPE"
      }
    },
    "category": null
  }
}
```

### Respuestas

**`200`** — Event received successfully.

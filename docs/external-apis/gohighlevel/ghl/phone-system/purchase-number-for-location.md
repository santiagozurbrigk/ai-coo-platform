---
title: "Purchase number for location"
source: "https://marketplace.gohighlevel.com/docs/ghl/phone-system/purchase-number-for-location"
seccion: "LC Phone > lc-phone > Purchase number for location"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/phone-system/numbers/location/:locationId/purchase"
---

# Purchase number for location

```http
POST /phone-system/numbers/location/:locationId/purchase
```

Purchase number for location. With `version: v3`, the HTTP 201 body is the standard success envelope (`status`, `data`, `message`, `statusCode`). The v3 purchase fields live under `data`: `number`, `locationId`, `id`, and `underLcAccount` (renamed from under_ghl_account).

## Request

### Header parameters

- **version** `string` _required_ — Send `v3` to use the v3 response contract (AIP). This is the supported version value for these endpoints.
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location ID as string

### Request body (application/json)

**Body required**

- **phoneNumber** `string` _required_ — phoneNumber to purchase
- **addressSid** `string` _required_ — addressSid twilio address id
- **bundleSid** `string` _required_ — bundleSid twilio bundle id
- **countryCode** `string` _required_ — country for which the phone numbers are being requested
- **numberType** `object` _required_ — type of phone number to be purchased
- **paymentIntentId** `string` _required_ — stripe payment intent id
- **stripeAccountId** `string` _required_ — stripe account id
- **paymentMethodId** `string` _required_ — stripe registered payment method id
- **locality** `string` _required_ — locality of the user in which number is being purchased
- **region** `string` _required_ — region of the user in which number is being purchased
- **fingerprintId** `string` _required_ — fingerprintId is request id which is unique for every purchase number request
- **skipLocationKYC** `boolean` _required_ — Skip location-level KYC verification if agency-level compliance has already been verified

```json
{
  "phoneNumber": "830236932",
  "addressSid": "ADXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "bundleSid": "BUXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "countryCode": "US",
  "numberType": "local",
  "paymentIntentId": "pi_3Oxxxxxxxxxxxxxxxxxxxx",
  "stripeAccountId": "acct_1Oxxxxxxxxxxxxxxxx",
  "paymentMethodId": "pm_1Oxxxxxxxxxxxxxxxx",
  "locality": "Austin",
  "region": "TX",
  "fingerprintId": "purchase-req-abc-123",
  "skipLocationKYC": false
}
```

### Response (201 · application/json)

Success envelope; v3 purchase details are in `data` (slim shape: number, locationId, id, underLcAccount).

**Schema**

- **status** `string` _required_ — Outcome indicator from the shared success helper.
  - Available options: `success`
- **data** `object` _required_ — V3 purchase payload: purchased number, location, Twilio account id, and underLcAccount.
- **message** `string` _required_ — Human-readable success message.
- **statusCode** `number` _required_ — HTTP status echoed in the response body.

```json
{
  "status": "success",
  "data": {
    "number": "+17745678902",
    "locationId": "tDtDnQdgm2LXpyiqYvZ6",
    "id": "twilio-account-123",
    "underLcAccount": false
  },
  "message": "Number purchase successful",
  "statusCode": 201
}
```

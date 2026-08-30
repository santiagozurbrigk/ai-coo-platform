---
title: "Create/Update Store Settings"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/create-store-setting"
seccion: "Store > Store Setting > Create/Update Store Settings"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/store/store-setting"
---

# Create/Update Store Settings

```http
POST /store/store-setting
```

Create or update store settings by altId and altType.

## Request

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **shippingOrigin** `object` _required_ — Shipping origin address
- **storeOrderNotification** `object` — Store order notification email
- **storeOrderFulfillmentNotification** `object` — Store order fulfillment notification email

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "shippingOrigin": {
    "name": "ABC Store",
    "country": "US",
    "state": "VA",
    "city": "Tokyo",
    "street1": "Street 1",
    "street2": "Street 2",
    "zip": "674561",
    "phone": "+1-214-559-6993",
    "email": "[email protected]"
  },
  "storeOrderNotification": {
    "enabled": true,
    "subject": "Your order is placed !",
    "emailTemplateId": "6788d542f0462ffd6bc29bb9",
    "defaultEmailTemplateId": "6788d542f0462ffd6bc29bb9"
  },
  "storeOrderFulfillmentNotification": {
    "enabled": true,
    "subject": "Order fulfilled",
    "emailTemplateId": "6788d542f0462ffd6bc29bb9",
    "defaultEmailTemplateId": "6788d542f0462ffd6bc29bb9"
  }
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **status** `boolean` _required_ — Status of api action
- **message** `string` — Success message
- **data** `object` _required_ — Shipping carrier data

```json
{
  "status": true,
  "message": "Successfully created",
  "data": {
    "altId": "6578278e879ad2646715ba9c",
    "altType": "location",
    "shippingOrigin": {
      "name": "ABC Store",
      "country": "US",
      "state": "VA",
      "city": "Tokyo",
      "street1": "Street 1",
      "street2": "Street 2",
      "zip": "674561",
      "phone": "+1-214-559-6993",
      "email": "[email protected]"
    },
    "storeOrderNotification": {
      "enabled": true,
      "subject": "Your order is placed !",
      "emailTemplateId": "6788d542f0462ffd6bc29bb9",
      "defaultEmailTemplateId": "6788d542f0462ffd6bc29bb9"
    },
    "storeOrderFulfillmentNotification": {
      "enabled": true,
      "subject": "Order fulfilled",
      "emailTemplateId": "6788d542f0462ffd6bc29bb9",
      "defaultEmailTemplateId": "6788d542f0462ffd6bc29bb9"
    },
    "_id": "655b33a82209e60b6adb87a5",
    "createdAt": "2023-12-12T09:27:42.355Z",
    "updatedAt": "2023-12-12T09:27:42.355Z"
  }
}
```

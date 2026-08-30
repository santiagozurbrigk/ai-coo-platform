---
title: "Send invoice"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/send-invoice"
seccion: "Invoice > Invoice > Send invoice"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/invoices/:invoiceId/send"
---

# Send invoice

```http
POST /invoices/:invoiceId/send
```

API to send invoice by invoice id

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **invoiceId** `string` _required_ — Invoice Id

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — location Id / company Id based on altType
- **altType** `string` _required_ — Alt Type
  - Available options: `location`
- **userId** `string` _required_ — Please ensure that the UserId corresponds to an authorized personnel, either by an employee ID or agency ID, to access this location. This account will serve as the primary channel for all future communications and updates.
- **action** `string` _required_
  - Available options: `sms_and_email`, `send_manually`, `email`, `sms`
- **liveMode** `boolean` _required_
- **sentFrom** `object` — sender details for invoice, valid only if invoice is not sent manually
- **autoPayment** `object` — auto-payment configuration

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "userId": "6578278e879ad2646715ba9c",
  "action": "sms_and_email",
  "liveMode": true,
  "sentFrom": {
    "fromName": "Alex",
    "fromEmail": "[email protected]"
  },
  "autoPayment": {
    "enable": true,
    "type": "string",
    "paymentMethodId": "string",
    "customerId": "string",
    "card": {
      "brand": "string",
      "last4": "string"
    },
    "usBankAccount": {
      "bank_name": "string",
      "last4": "string"
    },
    "sepaDirectDebit": {
      "bank_code": "string",
      "last4": "string",
      "branch_code": "string"
    },
    "bacsDirectDebit": {
      "sort_code": "string",
      "last4": "string"
    },
    "becsDirectDebit": {
      "bsb_number": "string",
      "last4": "string"
    },
    "cardId": "string",
    "provider": {}
  }
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **invoice** `object` _required_
- **smsData** `object` _required_
- **emailData** `object` _required_

```json
{
  "invoice": {
    "_id": "6578278e879ad2646715ba9c",
    "status": "draft",
    "liveMode": false,
    "amountPaid": 0,
    "altId": "6578278e879ad2646715ba9c",
    "altType": "location",
    "name": "New Invoice",
    "businessDetails": {
      "name": "Alex",
      "address": {
        "addressLine1": "9931 Beechwood",
        "city": "St. Houston",
        "state": "TX",
        "countryCode": "USA",
        "postalCode": "559-6993"
      },
      "phoneNo": "+1-214-559-6993",
      "website": "www.example.com"
    },
    "invoiceNumber": "19",
    "currency": "USD",
    "contactDetails": {
      "id": "c6tZZU0rJBf30ZXx9Gli",
      "phoneNo": "+1-214-559-6993",
      "email": "[email protected]",
      "customFields": [],
      "name": "Alex",
      "address": {
        "countryCode": "US"
      }
    },
    "issueDate": "2023-01-01",
    "dueDate": "2023-01-01",
    "discount": {
      "type": "percentage",
      "value": 0
    },
    "invoiceItems": [
      {
        "taxes": [],
        "_id": "c6tZZU0rJBf30ZXx9Gli",
        "productId": "c6tZZU0rJBf30ZXx9Gli",
        "priceId": "c6tZZU0rJBf30ZXx9Gli",
        "currency": "USD",
        "name": "Macbook Pro",
        "qty": 1,
        "amount": 999
      }
    ],
    "total": 999,
    "title": "INVOICE",
    "amountDue": 999,
    "createdAt": "2023-12-12T09:27:42.355Z",
    "updatedAt": "2023-12-12T09:27:42.355Z",
    "automaticTaxesEnabled": true,
    "automaticTaxesCalculated": true,
    "paymentSchedule": {}
  },
  "smsData": {},
  "emailData": {}
}
```

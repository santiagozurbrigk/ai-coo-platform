---
title: "Get Invoice Settings"
source: "https://marketplace.gohighlevel.com/docs/ghl/invoices/get-invoice-settings"
seccion: "Invoice > Invoice > Get Invoice Settings"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/invoices/settings"
---

# Get Invoice Settings

```http
GET /invoices/settings
```

Get the invoice settings for the given location

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`

### Response (200 · application/json)

Successful response

**Schema**

- **altId** `string` — Sub-Account Id
- **altType** `string` — Alt Type
  - Available options: `location`
- **termsNote** `string` — Terms and conditions for invoices
- **estimatesTermsNote** `string` — Terms and conditions for estimates
- **title** `string` — Title for invoices **Possible values:** `<= 40 characters`
- **estimatesTitle** `string` — Title for estimates **Possible values:** `<= 40 characters`
- **invoiceNumberPrefix** `string` — Prefix for invoice numbers **Possible values:** `<= 10 characters`
- **estimateNumberPrefix** `string` — Prefix for estimate numbers **Possible values:** `<= 10 characters`
- **dueAfterXDays** `number` — Number of days after which invoice is due
- **estimatesExpireAfterXDays** `number` — Number of days after which estimate expires
- **minimumPercentagePartialPayment** `number` — Minimum percentage for partial payment
- **customFields** `string[]` — Custom fields array **Possible values:** `<= 3`
- **customNotification** `object` — Custom notification settings
- **businessDetails** `object` — Business details
- **senderConfiguration** `object` — Sender configuration
- **productSettings** `object` — Product settings
- **reminderSettings** `object` — Reminder settings
- **lateFeesConfiguration** `object` — Late fees configuration
- **tipsConfiguration** `object` — Tips configuration
- **paymentMethods** `object` — Payment methods configuration

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "termsNote": "Payment is due within 30 days.",
  "estimatesTermsNote": "This estimate is valid for 30 days.",
  "title": "INVOICE",
  "estimatesTitle": "ESTIMATE",
  "invoiceNumberPrefix": "INV-",
  "estimateNumberPrefix": "EST-",
  "dueAfterXDays": 30,
  "estimatesExpireAfterXDays": 30,
  "minimumPercentagePartialPayment": 25,
  "customFields": [
    "6578278e879ad2646715baxc",
    "6901e9fb77ac4d701ba0b996"
  ],
  "customNotification": {
    "customerSendInvoice": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "teamPaymentSuccess": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "customerPaymentSuccess": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "teamAutoPaymentSuccess": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "customerAutoPaymentSuccess": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "teamPaymentFailure": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "customerPaymentFailure": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "teamAutoPaymentFailure": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "customerAutoPaymentFailure": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "customerAutoPaymentInfo": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "customerAutoPaymentAmountChanged": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "teamAutoPaymentSkip": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "teamRecurringSendInvoiceFailed": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "customerSendEstimate": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "teamEstimateAccepted": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    },
    "teamEstimateDeclined": {
      "enabled": true,
      "emailTemplate": "string",
      "smsTemplate": "string",
      "fromName": "Alex",
      "fromEmail": "[email protected]",
      "emailSubject": "Thank you for purchasing",
      "defaultEmailTemplateId": "dhwjqi2899012990w2u"
    }
  },
  "businessDetails": {
    "logoUrl": "string",
    "name": "string",
    "phoneNo": "string",
    "address": {
      "addressLine1": "string",
      "addressLine2": "string",
      "city": "string",
      "state": "string",
      "countryCode": "AF",
      "postalCode": "string"
    },
    "website": "string",
    "customValues": [
      "string"
    ]
  },
  "senderConfiguration": {
    "fromName": "Alex",
    "fromEmail": "[email protected]"
  },
  "productSettings": {
    "enableImportProductDescription": true,
    "descriptionOptional": true
  },
  "reminderSettings": {
    "defaultEmailTemplateId": "dhwjqi2899012990w2u",
    "reminders": [
      {
        "enabled": true,
        "emailTemplate": "default",
        "smsTemplate": "default",
        "emailSubject": "Reminder",
        "reminderId": "9333e45f-a27d-4659-90e5-76c5ef06d094",
        "reminderName": "Special Reminder",
        "reminderTime": "before",
        "intervalType": "daily",
        "maxReminders": 3,
        "reminderInvoiceCondition": "invoice_sent",
        "reminderNumber": 10,
        "startTime": "9:00 AM",
        "endTime": "5:00 PM",
        "timezone": "businessTZ"
      }
    ]
  },
  "lateFeesConfiguration": {
    "enable": true,
    "value": 10,
    "type": "fixed",
    "frequency": {
      "intervalCount": 10,
      "interval": "day"
    },
    "grace": {
      "intervalCount": 10,
      "interval": "day"
    },
    "maxLateFees": {
      "type": "fixed",
      "value": "10"
    }
  },
  "tipsConfiguration": {
    "tipsPercentage": [
      5,
      10,
      15
    ],
    "tipsEnabled": true
  },
  "paymentMethods": {
    "stripe": {
      "enableBankDebitOnly": false
    }
  }
}
```

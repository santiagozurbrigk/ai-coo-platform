---
title: "List available phone numbers"
source: "https://marketplace.gohighlevel.com/docs/ghl/phone-system/list-available-numbers-for-a-country"
seccion: "LC Phone > lc-phone > List available phone numbers"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/phone-system/numbers/location/:locationId/available"
---

# List available phone numbers

```http
GET /phone-system/numbers/location/:locationId/available
```

Search Twilio inventory for purchasable phone numbers in a country for the given location.

## Request

### Path parameters

- **locationId** `string` _required_ — Location ID as string

### Query parameters

- **firstPart** `string` _required_ — firstPart is the beginning of the phone number
- **lastPart** `string` _required_ — lastPart is the ending of the phone number
- **anywhere** `string` _required_ — anywhere are the numbers required anywhere in phone number
- **numberTypes** `string[]` _required_ — comma separated types of phone number required
- **smsEnabled** `boolean` _required_ — requested phone numbers should have sms functionality
- **mmsEnabled** `boolean` _required_ — requested phone numbers should have mms functionality
- **voiceEnabled** `boolean` _required_ — requested phone numbers should have voice functionality
- **countryCode** `string` _required_ — country for which the phone numbers are being requested

### Response (200)

Available phone numbers matching the search criteria.

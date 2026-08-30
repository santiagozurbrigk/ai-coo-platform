---
title: "Create Sub-Account (Formerly Location)"
source: "https://marketplace.gohighlevel.com/docs/ghl/locations/create-location"
seccion: "Sub-Account (Formerly location) > Sub-Account (Formerly Location) > Create Sub-Account (Formerly Location)"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/locations/"
---

# Create Sub-Account (Formerly Location)

```http
POST /locations/
```

Create a new Sub-Account (Formerly Location) based on the data provided

infoThis feature is only available on Agency Pro ($497) plan.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **name** `string` _required_ — The name for the sub-account/location
- **phone** `string` — The phone number of the business for which sub-account is created with the appropriate country-code
- **companyId** `string` _required_ — Company/Agency Id
- **address** `string` — The address of the business for which sub-account is created
- **city** `string` — The city where the business is located for which sub-account is created
- **state** `string` — The state in which the business operates for which sub-account is created
- **country** `string` — The 2 letter country-code in which the business is present for which sub-account is created
  - Available options: `AF`, `AX`, `AL`, `DZ`, `AS`, `AD`, `AO`, `AI`, `AQ`, `AG`, `AR`, `AM`
- **postalCode** `string` — The postal code of the business for which sub-account is created
- **website** `string` — The website of the business for which sub-account is created
- **timezone** `string` — The timezone of the business for which sub-account is created
- **prospectInfo** `object`
- **settings** `object` — The default settings for location
- **social** `object` — The social media links for location
- **twilio** `object` — (DEPRECATED) The twilio credentials for location
- **mailgun** `object` — The mailgun credentials for location
- **snapshotId** `string` — The snapshot ID to be loaded into the location.

```json
{
  "name": "Mark Shoes",
  "phone": "+1410039940",
  "companyId": "UAXssdawIWAWD",
  "address": "4th fleet street",
  "city": "New York",
  "state": "Illinois",
  "country": "US",
  "postalCode": "567654",
  "website": "https://yourwebsite.com",
  "timezone": "US/Central",
  "prospectInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "[email protected]"
  },
  "settings": {
    "allowDuplicateContact": false,
    "allowDuplicateOpportunity": false,
    "allowFacebookNameMerge": false,
    "disableContactTimezone": false
  },
  "social": {
    "facebookUrl": "https://www.facebook.com/",
    "googlePlus": "https://www.googleplus.com/",
    "linkedIn": "https://www.linkedIn.com/",
    "foursquare": "https://www.foursquare.com/",
    "twitter": "https://www.foutwitterrsquare.com/",
    "yelp": "https://www.yelp.com/",
    "instagram": "https://www.instagram.com/",
    "youtube": "https://www.youtube.com/",
    "pinterest": "https://www.pinterest.com/",
    "blogRss": "https://www.blogRss.com/",
    "googlePlacesId": "ChIJJGPdVbQTrjsRGUkefteUeFk"
  },
  "mailgun": {
    "apiKey": "key-XXXXXXXXXXX",
    "domain": "replies.yourdomain.com"
  },
  "snapshotId": "XXXXXXXXXXX"
}
```

### Response (200 · application/json)

Successful response

**Schema**

- **id** `string` — Location Id
- **companyId** `string` — Company/Agency Id
- **name** `string` — The name for the sub-account/location
- **phone** `string` — The phone number of the business for which sub-account is created
- **email** `string` — The email for the sub-account/location
- **address** `string` — The address of the business for which sub-account is created
- **city** `string` — The city where the business is located for which sub-account is created
- **state** `string` — The state in which the business operates for which sub-account is created
- **domain** `string`
- **country** `string` — The country in which the business is present for which sub-account is created
  - Available options: `AF`, `AX`, `AL`, `DZ`, `AS`, `AD`, `AO`, `AI`, `AQ`, `AG`, `AR`, `AM`
- **postalCode** `string` — The postal code of the business for which sub-account is created
- **website** `string` — The website of the business for which sub-account is created
- **timezone** `string` — The timezone of the business for which sub-account is created
- **settings** `object` — The default settings for location
- **social** `object` — The social media links for location

```json
{
  "id": "ve9EPM428h8vShlRW1KT",
  "companyId": "UAXssdawIWAWD",
  "name": "Mark Shoes",
  "phone": "+1410039940",
  "email": "[email protected]",
  "address": "4th fleet street",
  "city": "New York",
  "state": "Illinois",
  "domain": "test.msgsndr.com",
  "country": "US",
  "postalCode": "567654",
  "website": "https://yourwebsite.com",
  "timezone": "US/Central",
  "settings": {
    "allowDuplicateContact": false,
    "allowDuplicateOpportunity": false,
    "allowFacebookNameMerge": false,
    "disableContactTimezone": false
  },
  "social": {
    "facebookUrl": "https://www.facebook.com/",
    "googlePlus": "https://www.googleplus.com/",
    "linkedIn": "https://www.linkedIn.com/",
    "foursquare": "https://www.foursquare.com/",
    "twitter": "https://www.foutwitterrsquare.com/",
    "yelp": "https://www.yelp.com/",
    "instagram": "https://www.instagram.com/",
    "youtube": "https://www.youtube.com/",
    "pinterest": "https://www.pinterest.com/",
    "blogRss": "https://www.blogRss.com/",
    "googlePlacesId": "ChIJJGPdVbQTrjsRGUkefteUeFk"
  }
}
```

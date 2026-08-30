---
title: "Get available shipping rates"
source: "https://marketplace.gohighlevel.com/docs/ghl/store/get-available-shipping-zones"
seccion: "Store > Shipping Zone > Get available shipping rates"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/store/shipping-zone/shipping-rates"
---

# Get available shipping rates

```http
POST /store/shipping-zone/shipping-rates
```

This return available shipping rates for country based on order amount

## Request

### Request body (application/json)

**Body required**

- **altId** `string` _required_ — Location Id or Agency Id
- **altType** `string` _required_
  - Available options: `location`
- **country** `string` _required_ — Country code of the customer
  - Available options: `US`, `CA`, `AF`, `AX`, `AL`, `DZ`, `AS`, `AD`, `AO`, `AI`, `AQ`, `AG`
- **address** `object` — Address of the customer
- **amountAvailable** `string` — it will not calculate the order amount form backend if it is true
  - Available options: `AF`, `AX`, `AL`, `DZ`, `AS`, `AD`, `AO`, `AI`, `AQ`, `AG`, `AR`, `AM`
- **totalOrderAmount** `number` _required_ — The amount of the price. ( min: 0.01 )
- **weightAvailable** `boolean` — Flag to pass when the weight is already calculated and should not calculate again
- **totalOrderWeight** `number` _required_ — Estimated weight of the order calculated from the order creation side in kg(s)
- **source** `object` _required_ — Source of the order
- **products** `object[]` _required_ — An array of price IDs and quantity
- **couponCode** `string` — Coupon code

```json
{
  "altId": "6578278e879ad2646715ba9c",
  "altType": "location",
  "country": "US",
  "address": {
    "name": "John Doe",
    "companyName": "ABC Company",
    "addressLine1": "123 Main St.",
    "country": "US",
    "state": "US",
    "city": "New York",
    "zip": "12345",
    "phone": "1234567890",
    "email": "[email protected]"
  },
  "amountAvailable": "US",
  "totalOrderAmount": 99.99,
  "weightAvailable": true,
  "totalOrderWeight": 10,
  "source": {
    "type": "order",
    "subType": "store"
  },
  "products": [
    {
      "id": "string",
      "qty": 0
    }
  ],
  "couponCode": "TEST"
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **status** `boolean` _required_ — Status of api action
- **message** `string` — Success message
- **data** `object[]` _required_ — Shipping rate data

```json
{
  "status": true,
  "message": "Successfully created",
  "data": [
    {
      "name": "North zone",
      "description": "Ships next day",
      "currency": "USD",
      "amount": 99.99,
      "isCarrierRate": true,
      "shippingCarrierId": "655b33a82209e60b6adb87a5",
      "percentageOfRateFee": 10.99,
      "shippingCarrierServices": [
        {
          "name": "Priority Mail Express International",
          "value": "PriorityMailExpressInternational"
        }
      ],
      "_id": "655b33a82209e60b6adb87a5",
      "shippingZoneId": "655b33a82209e60b6adb87a5"
    }
  ]
}
```

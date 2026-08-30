---
title: "List Subscriptions"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/list-subscriptions"
seccion: "Payments > Subscriptions > List Subscriptions"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/subscriptions"
---

# List Subscriptions

```http
GET /payments/subscriptions
```

The "List Subscriptions" API allows to retrieve a paginated list of subscriptions. Customize your results by filtering subscriptions based on name, alt type, subscription status, payment mode, date range, type of source, contact, subscription id, entity id, contact or paginate through the list using the provided query parameters. This endpoint provides a straightforward way to explore and retrieve subscription information.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **altId** `string` _required_ — AltId is the unique identifier e.g: location id.
- **altType** `string` _required_ — AltType is the type of identifier.
  - Available options: `location`
- **entityId** `string` — Entity id for filtering of subscriptions.
- **paymentMode** `string` — Mode of payment.
- **startAt** `string` — Starting interval of subscriptions.
- **endAt** `string` — Closing interval of subscriptions.
- **entitySourceType** `string` — Source of the subscriptions.
- **search** `string` — The name of the subscription for searching.
- **contactId** `string` — Contact ID for the subscription
- **id** `string` — Subscription id for filtering of subscriptions.
- **limit** `number` — The maximum number of items to be included in a single page of results

  Default value:

  `10`

- **offset** `number` — The starting index of the page, indicating the position from which the results should be retrieved.

  Default value:

  `0`

- **getPaymentsCollectedCount** `boolean` — Get the total payments collected for the subscription.

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object[]` _required_ — An array of subscriptions
- **totalCount** `number` _required_ — total subscriptions count

```json
{
  "data": [
    {
      "_id": "64bf78af39118e4011926cba",
      "altId": "3SwdhCu3svxI8AKsPJt6",
      "altType": "location",
      "contactId": "XPLSw2SVagl12LMDeTmQ",
      "contactName": "James Bond",
      "contactEmail": "[email protected]",
      "currency": "USD",
      "amount": "100",
      "status": "active",
      "liveMode": "false",
      "entityType": "order",
      "entityId": "62f4db0f3059ecee61379012",
      "entitySourceType": "funnel",
      "entitySourceName": "Attribution Funnel",
      "entitySourceId": "bevrkPbLaDNXFaqfLKMm",
      "entitySourceMeta": "{ domain: \"app.gohighlevel.com\", pageId:  \"sxC4lNhFIavEnLZh5KhC\", pageUrl:  \"/v2/preview/sxC4lNhFIavEnLZh5KhC\", stepId: \"7d303d1f-cb85-403d-b548-bf01de5c7bb0\" }",
      "subscriptionId": "I-0UE609H8E43P",
      "subscriptionSnapshot": "{ status: \"ACTIVE\", status_update_time: \"2022-08-16T11:06:53Z\", id: \"I-0UE609H8E43P\", plan_id: \"P-82K11750F0313430KMLRGE6Y\", start_time: \"2022-08-16T11:05:31Z\", quantity: 1 }",
      "paymentProviderType": "stripe",
      "paymentProviderConnectedAccount": "ATn0CqrzrWS5ak185Bsb1xCpyzBDOZ8WdRxyFotppLYePTDhiuQ49H5QXO_L-4HKk1GBn7f9_QhbNK2s",
      "ipAddress": "103.100.16.82",
      "createdAt": "2023-11-20T10:23:36.515Z",
      "updatedAt": "2023-11-20T10:23:36.515Z",
      "createdBy": "user123"
    }
  ],
  "totalCount": 0
}
```

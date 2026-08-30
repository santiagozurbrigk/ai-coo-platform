---
title: "List Transactions"
source: "https://marketplace.gohighlevel.com/docs/ghl/payments/list-transactions"
seccion: "Payments > Transactions > List Transactions"
api_version: "v3"
capturado: "2026-08-30"
metodo: "GET"
path: "/payments/transactions"
---

# List Transactions

```http
GET /payments/transactions
```

The "List Transactions" API allows to retrieve a paginated list of transactions. Customize your results by filtering transactions based on name, alt type, transaction status, payment mode, date range, type of source, contact, subscription id, entity id or paginate through the list using the provided query parameters. This endpoint provides a straightforward way to explore and retrieve transaction information.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Query parameters

- **locationId** `string` — LocationId is the id of the sub-account.
- **altId** `string` _required_ — AltId is the unique identifier e.g: location id.
- **altType** `string` _required_ — AltType is the type of identifier.
- **paymentMode** `string` — Mode of payment.
- **startAt** `string` — Starting interval of transactions.
- **endAt** `string` — Closing interval of transactions.
- **entitySourceType** `string` — Source of the transactions.
- **entitySourceSubType** `string` — Source sub-type of the transactions.
- **search** `string` — The name of the transaction for searching.
- **subscriptionId** `string` — Subscription id for filtering of transactions.
- **entityId** `string` — Entity id for filtering of transactions.
- **contactId** `string` — Contact id for filtering of transactions.
- **limit** `number` — The maximum number of items to be included in a single page of results

  Default value:

  `10`

- **offset** `number` — The starting index of the page, indicating the position from which the results should be retrieved.

  Default value:

  `0`

### Response (200 · application/json)

Successful response

**Schema**

- **data** `object[]` _required_ — An array of transactions
- **totalCount** `number` _required_ — total transactions count

```json
{
  "data": [
    {
      "_id": "61dd0feac077f72010f78804",
      "altId": "3SwdhCu3svxI8AKsPJt6",
      "altType": "location",
      "contactId": "XPLSw2SVagl12LMDeTmQ",
      "mergedFromContactId": "XPLSw2SVagl12LMDeTmQ",
      "contactName": "James Bond",
      "contactEmail": "[email protected]",
      "currency": "USD",
      "amount": "100",
      "status": "succeeded",
      "liveMode": "false",
      "entityType": "order",
      "entityId": "61dd0fe9c077f73e67f78803",
      "entitySourceType": "funnel",
      "entitySourceSubType": "two_step_order_form",
      "entitySourceName": "new funnel",
      "entitySourceId": "BDBMEghdIUaqMPEsK349",
      "entitySourceMeta": "{ domain: \"app.gohighlevel.com\", pageId:  \"rBVhyYhMsbxbO8ZqOcei\", pageUrl:  \"/v2/preview/rBVhyYhMsbxbO8ZqOcei\", stepId:   \"5a772f62-3fbc-418b-af1b-be8929dd64c2\"}",
      "subscriptionId": "sub_1KGcXDCScnf89tZoVkoEMCEL",
      "chargeId": "in_1KGcXDCScnf89tZohCsmImwE",
      "chargeSnapshot": "{ id: \"in_1KGcXDCScnf89tZohCsmImwE\", object: \"invoice\", account_country: \"US\",  account_name:  \"GHL-Testing\" }",
      "paymentProviderType": "stripe",
      "paymentProviderConnectedAccount": "612ca676b484b241fef9d962",
      "ipAddress": "107.178.194.224",
      "createdAt": "2023-11-20T10:23:36.515Z",
      "updatedAt": "2023-11-20T10:23:36.515Z",
      "amountRefunded": "10",
      "paymentMethod": "{ card: { \"brand\": \"discover\", \"last4\": \"0012\" } }",
      "fulfilledAt": "2023-11-20T10:27:36.515Z",
      "createdBy": "user123"
    }
  ],
  "totalCount": 0
}
```

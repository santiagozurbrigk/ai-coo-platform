---
title: "Create"
source: "https://docs.whop.com/api-reference/beta/audiences/create-audience"
capturado: "2026-08-30"
metodo: "POST"
path: "/audiences"
---

# Create

> Creates an audience. Default (`audience_type` omitted or `custom`): creates one audience from an uploaded customer identity CSV file (`name`, `column_mapping`, and `file_id` required) and starts processing it; responds with the audience object. With `filters`: creates an audience from saved People filters (`name` required) — membership is built from the account's People data, and `auto_refresh` decides whether it keeps tracking the filters or keeps whoever matched at creation. With `audience_type: lookalike`: creates a ladder of Meta lookalike audiences from an existing ready custom audience (`source_audience_id`, `count`, and `percentage` required) — `count` equal similarity bands slicing the top `percentage`% (3 audiences at 6% = 0–2%, 2–4%, 4–6%), each returned as its own audience in a `{ data: [...] }` envelope.

Upload the customer CSV with [`POST /files`](/api-reference/files/create-file) on the Legacy API (file upload has no versioned endpoint yet), then pass the returned `file_...` ID as `file_id`.

`column_mapping` tells Whop which CSV header contains each identity field. Headers can be custom, but Whop skips rows that lack both email and phone. After creating the audience, poll [List Audiences](/api-reference/beta/audiences/list-audiences) until `status` is `ready`, `partial`, or `failed`.

Map `ltv` to a column of per-customer lifetime values to build a value-based audience. Lookalikes created from it favor people similar to your highest-value customers.

<RequestExample>
  ```csv CSV file theme={null}
  Email,Phone,First Name,Last Name,Country,LTV
  jenny.nuo@example.com,+14155550123,Jenny,Nuo,US,249.50
  ```

  ```json Request body theme={null}
  {
  	"account_id": "biz_xxxxxxxxxxxxxx",
  	"name": "Past purchasers",
  	"column_mapping": {
  		"email": "Email",
  		"phone": "Phone",
  		"first_name": "First Name",
  		"last_name": "Last Name",
  		"country": "Country",
  		"ltv": "LTV"
  	},
  	"file_id": "file_xxxxxxxxxxxxx"
  }
  ```
</RequestExample>


## OpenAPI

_La definición de este endpoint está en el spec oficial._

> **`POST /audiences`** — ver [ENDPOINTS-api-v1-native.md](../../../ENDPOINTS-api-v1-native.md#post-audiences) · spec: [`openapi/api-v1-native.json`](../../../openapi/api-v1-native.json)
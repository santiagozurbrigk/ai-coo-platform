---
title: "Hyros REST API — referencia de endpoints"
source: "https://api-docs.hyros.com/ai-context/rest-api.txt"
generado_desde: "openapi/rest-api.yaml"
capturado: "2026-08-30"
---

# Hyros REST API — referencia de endpoints

Leads, journeys, ventas, órdenes, llamadas, atribución de ads, productos, tags y fuentes.

- Versión declarada: `1.40`
- Auth `ApiKeyAuth`: apiKey / header `API-Key`
- Spec original: [`./openapi/rest-api.yaml`](./openapi/rest-api.yaml)

## Descripción del proveedor

## Status Codes

| Code | Meaning |
|------|---------|
| `200 OK` | Response to a successful GET, PUT, POST or DELETE |
| `400 Bad Request` | Malformed request; form validation errors |
| `401 Unauthorized` | Wrong Api-Key or not provided |
| `403 Forbidden` | Api-Key is valid but lacks a role the endpoint requires (`Missing role <ROLE>`), or the Accessible-Account-Id header targets an account that is not one of the caller's connected client accounts |
| `429 Too Many Requests` | Number of API requests per second exceeded |

## Unrecognized parameters and fields

On the endpoints listed below, requests must contain only documented query parameters and body fields. An unknown query parameter, an unknown top-level body field, or a query parameter repeated more than once, is rejected with `400 Bad Request` naming the offender instead of being ignored. The error body lists the offenders as `Unknown parameter: <name>`, `Duplicate parameter: <name>` or `Unknown field: <name>`. For example, `GET /api/v1.0/products?bogus=1` returns `400` with `Unknown parameter: bogus`.

Endpoints that enforce this:

- `GET /api/v1.0/products`, `PUT /api/v1.0/products/{id}`, `DELETE /api/v1.0/products/{id}`
- `GET /api/v1.0/carts`
- `GET /api/v1.0/custom-costs`, `PUT /api/v1.0/custom-costs/{id}`, `DELETE /api/v1.0/custom-costs/{id}`
- `PUT /api/v1.0/sources/{tag}`, `DELETE /api/v1.0/sources/{tag}`
- `GET /api/v1.0/tags/count`
- `GET /api/v1.0/attribution/roas`
- `GET /api/v1.0/requests/{request_id}`

On every other endpoint, unknown query parameters and unknown body fields are ignored, and a repeated query parameter takes its first value. The request succeeds and the unrecognized input has no effect, so a typo silently changes what you get back: `GET /api/v1.0/leads?email=someone@example.com` is not a filter on `emails`, it returns the unfiltered lead list. Keep your own input validation in place for those endpoints.

## Rate Limiting

| Limit Type | Requests | Window |
|------------|----------|--------|
| Per Second | 30 | 1 second |
| Per Minute | 1000 | 60 seconds |

| Header | Description | Example |
|--------|-------------|---------|
| `X-RateLimit-Limit` | Rate limit policy (`capacity;w=window_seconds`) | `30;w=1, 1000;w=60` |
| `X-RateLimit-Remaining` | Requests remaining in the most restrictive window | `25` |
| `X-RateLimit-Reset` | Unix timestamp when the rate limit resets | `1707235200` |
| `Retry-After` | Seconds to wait before retrying | `1` |

## Asynchronous Processing

Write operations (creates, updates and deletes) are processed **asynchronously**. A `200` response means the request was received and validated; the change is applied afterwards and may not be visible on an immediate read-back. Creates are typically visible within ~10 seconds. Updates and deletes typically take ~5 minutes, and can take longer under heavy load. Read (`GET`) operations are synchronous and return current data. Asynchronous operations are flagged with an **Asynchronous** note.

## Agency Access to Client Accounts

Agencies can act on a connected client account, identified by its external id, on both API surfaces. The rule is the same everywhere: the caller must have an approved connected-account relation with the target account, the request then runs against that account instead of the caller's own, and any other target is rejected with an authorization error (`Not authorized: account <id> is not one of your connected client accounts.`). When no account id is sent, the request operates on the caller's own account. Rate limits always apply to the caller.

* **REST API**: send the optional `Accessible-Account-Id` header on any `/api/v1.0` request. Unauthorized targets are rejected with `403 Forbidden` and the standard error body (`result: ERROR`).
* **MCP tools**: pass the optional `accessible_account_id` tool argument. It is advertised in `tools/list` only to agency accounts but validated on every call; unauthorized targets produce a tool error. Tools that are not tied to an account's data (docs search, integration types) and admin tools (which take a `productId` argument instead) do not accept it.

## Secciones del spec

### Leads

### Sales

### Orders

### Calls

### Attribution

### Ad Accounts

### Products

### Tags

### Sources

### Custom Costs

### Clicks

### Carts

### User Info

### Keywords

### Subscriptions

### Tracking Script

### Domains

### Stages

### Webhook Subscriptions

## Índice de endpoints

| Método | Path | Qué hace |
| --- | --- | --- |
| `GET` | [`/api/v1.0/ad-accounts`](#get-api-v1-0-ad-accounts) | List Ad Accounts |
| `GET` | [`/api/v1.0/ads`](#get-api-v1-0-ads) | List all Ads |
| `GET` | [`/api/v1.0/attribution`](#get-api-v1-0-attribution) | Get Ads Attribution Report |
| `GET` | [`/api/v1.0/attribution/ad-account`](#get-api-v1-0-attribution-ad-account) | Get Ad Accounts Attribution Report |
| `GET` | [`/api/v1.0/attribution/marginal-cac-curve`](#get-api-v1-0-attribution-marginal-cac-curve) | Get Marginal CAC Curve |
| `GET` | [`/api/v1.0/attribution/roas`](#get-api-v1-0-attribution-roas) | Get ROAS |
| `GET` | [`/api/v1.0/calls`](#get-api-v1-0-calls) | Retrieve Calls |
| `POST` | [`/api/v1.0/calls`](#post-api-v1-0-calls) | Create Call |
| `PUT` | [`/api/v1.0/calls`](#put-api-v1-0-calls) | Update Calls |
| `DELETE` | [`/api/v1.0/calls/{id}`](#delete-api-v1-0-calls-id) | Delete Call |
| `GET` | [`/api/v1.0/carts`](#get-api-v1-0-carts) | Retrieve Carts |
| `POST` | [`/api/v1.0/carts`](#post-api-v1-0-carts) | Create Cart |
| `PUT` | [`/api/v1.0/carts`](#put-api-v1-0-carts) | Update Cart |
| `POST` | [`/api/v1.0/clicks`](#post-api-v1-0-clicks) | Create Click |
| `GET` | [`/api/v1.0/custom-costs`](#get-api-v1-0-custom-costs) | Retrieve Custom Costs |
| `POST` | [`/api/v1.0/custom-costs`](#post-api-v1-0-custom-costs) | Create Custom Cost |
| `DELETE` | [`/api/v1.0/custom-costs/{id}`](#delete-api-v1-0-custom-costs-id) | Delete Custom Cost |
| `PUT` | [`/api/v1.0/custom-costs/{id}`](#put-api-v1-0-custom-costs-id) | Update Custom Cost |
| `GET` | [`/api/v1.0/keywords`](#get-api-v1-0-keywords) | Retrieve Keywords |
| `DELETE` | [`/api/v1.0/leads`](#delete-api-v1-0-leads) | Delete Lead |
| `GET` | [`/api/v1.0/leads`](#get-api-v1-0-leads) | Retrieve Leads |
| `POST` | [`/api/v1.0/leads`](#post-api-v1-0-leads) | Create Lead |
| `PUT` | [`/api/v1.0/leads`](#put-api-v1-0-leads) | Update Lead |
| `GET` | [`/api/v1.0/leads/clicks`](#get-api-v1-0-leads-clicks) | Retrieve Lead Clicks |
| `GET` | [`/api/v1.0/leads/journey`](#get-api-v1-0-leads-journey) | Retrieve Leads Journey |
| `POST` | [`/api/v1.0/orders`](#post-api-v1-0-orders) | Create Order |
| `DELETE` | [`/api/v1.0/orders/{id}`](#delete-api-v1-0-orders-id) | Refund Order |
| `PUT` | [`/api/v1.0/orders/{id}`](#put-api-v1-0-orders-id) | Update Order |
| `GET` | [`/api/v1.0/products`](#get-api-v1-0-products) | Retrieve Products |
| `POST` | [`/api/v1.0/products`](#post-api-v1-0-products) | Create Product |
| `DELETE` | [`/api/v1.0/products/{id}`](#delete-api-v1-0-products-id) | Delete Product |
| `PUT` | [`/api/v1.0/products/{id}`](#put-api-v1-0-products-id) | Update Product |
| `GET` | [`/api/v1.0/sales`](#get-api-v1-0-sales) | Retrieve Sales |
| `PUT` | [`/api/v1.0/sales`](#put-api-v1-0-sales) | Update Sales |
| `DELETE` | [`/api/v1.0/sales/{id}`](#delete-api-v1-0-sales-id) | Delete Sale |
| `GET` | [`/api/v1.0/sources`](#get-api-v1-0-sources) | List all Sources |
| `POST` | [`/api/v1.0/sources`](#post-api-v1-0-sources) | Create Source |
| `DELETE` | [`/api/v1.0/sources/{tag}`](#delete-api-v1-0-sources-tag) | Delete Source |
| `PUT` | [`/api/v1.0/sources/{tag}`](#put-api-v1-0-sources-tag) | Update Source |
| `GET` | [`/api/v1.0/stages`](#get-api-v1-0-stages) | Retrieve Lead Stages |
| `GET` | [`/api/v1.0/subscriptions`](#get-api-v1-0-subscriptions) | Retrieve Subscriptions |
| `POST` | [`/api/v1.0/subscriptions`](#post-api-v1-0-subscriptions) | Create Subscription |
| `PUT` | [`/api/v1.0/subscriptions`](#put-api-v1-0-subscriptions) | Update Subscription |
| `GET` | [`/api/v1.0/tags`](#get-api-v1-0-tags) | List all Tags |
| `GET` | [`/api/v1.0/tags/count`](#get-api-v1-0-tags-count) | List tags with lead counts |
| `GET` | [`/api/v1.0/tracking-script`](#get-api-v1-0-tracking-script) | Get Tracking Script |
| `GET` | [`/api/v1.0/user-info`](#get-api-v1-0-user-info) | Retrieve User Information |
| `GET` | [`/api/v1.0/webhook-subscriptions`](#get-api-v1-0-webhook-subscriptions) | Retrieve Webhook Subscriptions |
| `POST` | [`/api/v1.0/webhook-subscriptions`](#post-api-v1-0-webhook-subscriptions) | Create Webhook Subscription |
| `DELETE` | [`/api/v1.0/webhook-subscriptions/{externalId}`](#delete-api-v1-0-webhook-subscriptions-externalid) | Delete Webhook Subscription |
| `GET` | [`/api/v1/domains`](#get-api-v1-domains) | Get Domains |

---

## `GET /api/v1.0/ad-accounts`

**List Ad Accounts**

> [!NOTE] > **Required role** — Get Ad Accounts List the ad accounts connected to your account. Use the returned `id` values as the ad account id for the Ad Attribution endpoint (with `isAdAccountId=true`) and the Ad Account Attribution endpoint. Results are paginated: each response includes a `nextPageId`; pass it back as `pageId` to retrieve the following page. The last page has a `null` `nextPageId`.

tags: `Ad Accounts`

### Parámetros

- **ids** (`query`) `string` — Comma-separated ad account ids to filter by. If omitted, all connected ad accounts are returned. A maximum of 50 ids may be provided.
- **fields** (`query`) `string` — Comma-separated fields to include in each result. If omitted, all fields are returned. · valores: `name`, `type`
- **pageSize** (`query`) `integer` — The maximum number of ad accounts to return in a single page. Defaults to 50. · default: `50`
- **pageId** (`query`) `string` — The id of the next page to retrieve, taken from the `nextPageId` of a previous response. Any change to the other parameters resets pagination.

### Respuestas

**`200`** — Successful response.

- **request_id** `string`
- **nextPageId** `string` — Cursor for the next page, or null on the last page.
- **result** `object[]`
  - `array` de:
    - **id** `string`
    - **name** `string`
    - **type** `string`

```json
{
  "request_id": "43573923369e40bbafd46925a5c15ff5",
  "nextPageId": "b8f1c2d3e4a5",
  "result": [
    {
      "id": "205044496234",
      "name": "Acme - Meta Ads",
      "type": "FACEBOOK"
    },
    {
      "id": "118822334455",
      "name": "Acme - Google Ads",
      "type": "GOOGLE"
    }
  ]
}
```

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/ads`

**List all Ads**

> [!NOTE] > **Required role** — Get Ads Search and retrieve ads by adSpendType/adSpendId.

tags: `Sources`

### Parámetros

- **integrationType** (`query`) `AdspendType`
- **adSourceIds** (`query`) `string`
- **pageSize** (`query`) `integer` — Between 1 and 250.
- **pageId** (`query`) `string`

### Respuestas

**`200`** — Successful response.

- **result** `object[]`
  - `array` de:
    - **name** `string`
    - **adSource** `AdSource`
      - **adSourceId** `string`
      - **adAccountId** `string`
      - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
    - **source** `Source`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **creationDate** `integer` — Returned as epoch milliseconds (a number) instead of ISO 8601.
    - **creationDate** `integer` — Returned as epoch milliseconds (a number) instead of ISO 8601.
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/attribution`

**Get Ads Attribution Report**

> [!NOTE] > **Required role** — Get Attribution Retrieves Facebook AdSet or Google Campaign attribution information. **Notes:** - When `isAdAccountId` is `true` and `timeGroupingOption` is `day`, `week`, `month`, or `year`, the request will fail. - When `status` is `active` or `paused` and `timeGroupingOption` is not `source_link`, the request will fail.

tags: `Attribution`

### Parámetros

- **attributionModel** (`query`) `string` _requerido_ — Attribution model. · valores: `last_click`, `scientific`, `first_click`
- **startDate** (`query`) `string` _requerido_ — ISO 8601 starting date.
- **endDate** (`query`) `string` _requerido_ — ISO 8601 ending date.
- **level** (`query`) `string` _requerido_ — Attribution level for the report. · valores: `google_campaign`, `google_v2_adgroup`, `google_ad`, `google_v2_keyword`, `facebook_adset`, `facebook_campaign`, `tiktok_adgroup`, `snapchat_adsquad`, `pinterest_adgroup`, `twitter_adgroup`, `bing_adgroup`, `linkedin_campaign`, `facebook_ad`, `tiktok_ad`, `snapchat_ad`, `pinterest_ad`, `bing_ad`
- **fields** (`query`) `string` _requerido_ — Comma-separated fields to include in the report. Available values: `sales`, `revenue`, `calls`, `total_revenue`, `recurring_revenue`, `refund`, `unique_sales`, `leads`, `new_leads`, `cost`, `profit`, `roi`, `roas`, `refund_count`, `refund_sales_percentage`, `refund_revenue_percentage`, `cost_per_call`, `cost_per_lead`, `cost_per_sale`, `cost_per_new_lead`, `cost_per_unique_sale`, `unique_customers`, `unique_customers_revenue`, `cost_per_unique_customer`, `net_profit`, `hard_costs`, `qualified_calls`, `unqualified_calls`, `cost_per_qualified_call`, `time_of_sale_attribution`, `time_of_call_attribution`, `clicks`, `new_visits`, `cost_per_new_visit`, `cost_per_click`, `reported`, `reported_result`, `shop_reported_result`, `reported_vs_revenue`, `new_customers_percentage`, `recurring_customers`, `total_customers`, `customers`, `ctr`, `cpm`, `cvr`, `impressions`, `gross_margins`, `partial_video_views`, `unique_calls`, `canceled_calls`, `cost_per_unique_call`, `net_profit_percentage`, `taxes`, `cost_of_goods`, `shipping_value`, `30_days_ltv`, `60_days_ltv`, `90_days_ltv`, `6_months_ltv`, `1_year_ltv`, `30_days_ltv_forecast`, `60_days_ltv_forecast`, `90_days_ltv_forecast`, `6_months_ltv_forecast`, `1_year_ltv_forecast`, `churn_rate`, `one_time_sales`, `subscription_30_days_forecast`, `subscription_60_days_forecast`, `subscription_90_days_forecast`, `subscription_6_months_forecast`, `subscription_1_year_forecast`, `cac`, `aov`, `new_subscriptions`, `canceled_subscriptions`, `direct_subscriptions`, `new_mrr`, `new_trials`, `converted_trials`, `canceled_trials`, `cost_per_new_subscriptions`, `cost_per_new_trials`, `carts`, `atc_events`, `purchased_carts`, `atc_cvr`, `atc_rate`, `cost_per_atc`, `name`, `parent_name`
- **ids** (`query`) `string` _requerido_ — Comma-separated ids based on the `level`. Can be an ad account id when `isAdAccountId` is true (only one allowed).
- **keywordsIds** (`query`) `string` — Map of ad group ids and keywords. Only for `google_v2_keyword` level.
- **currency** (`query`) `string` · valores: `usd`, `user_currency` · default: `user_currency`
- **dayOfAttribution** (`query`) `boolean` — If true, filters by click date instead of sale date. · default: `False`
- **scientificDaysRange** (`query`) `integer` — Day range (1-30) for first ad attribution. Used with scientific model. · default: `30`
- **sourceConfiguration** (`query`) `string` · valores: `all_sources`, `only_organic`, `only_paid`, `prioritize_organic`, `prioritize_paid`
- **ignoreRecurringSales** (`query`) `boolean` · default: `False`
- **isAdAccountId** (`query`) `boolean` — If true, the id in `ids` is an ad account ID. All sources of that account will be paginated. · default: `False`
- **forecastingOption** (`query`) `string` · valores: `first_sale`, `total_sales` · default: `first_sale`
- **windowAttributionDaysRange** (`query`) `integer` — Days range for discard attribution (0-365). · default: `0`
- **newCustomerConfiguration** (`query`) `string` · valores: `all_customers`, `only_returning_customers`, `only_unique_customers`
- **status** (`query`) `string` — Filter ad spend by status. Only supported when `timeGroupingOption` is `source_link`. · valores: `active`, `paused`
- **timeGroupingOption** (`query`) `string` · valores: `source_link`, `day`, `week`, `month`, `year` · default: `source_link`
- **lead_stage** (`query`) `string` — Filters the report to sources with leads in any of the given account lead stages, by stage name (case-insensitive), comma-separated (e.g. `mql,sql,customer`). An unknown stage name returns a 400.
- **pageSize** (`query`) `integer` — Maximum number of sources per page. Range 1-250.
- **pageId** (`query`) `string`

### Respuestas

**`200`** — Successful response.

- **request_id** `string`
- **result** `object[]`
  - `array` de:
    - `object` de claves libres

```json
{
  "request_id": "d3d80491c48140b89a23071d19c0f88f",
  "result": [
    {
      "id": "205044496234",
      "revenue": 997.0,
      "sales": 10,
      "calls": 5,
      "campaign_id": "23843648123456789"
    }
  ]
}
```

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/attribution/ad-account`

**Get Ad Accounts Attribution Report**

> [!NOTE] > **Required role** — Get Ad Account Attribution Retrieves Ad account attribution information.

tags: `Attribution`

### Parámetros

- **attributionModel** (`query`) `string` _requerido_ · valores: `last_click`, `scientific`, `first_click`
- **startDate** (`query`) `string` _requerido_
- **endDate** (`query`) `string` _requerido_
- **fields** (`query`) `string` _requerido_ — Comma-separated fields to include in the report (same set as Ad Attribution endpoint).
- **ids** (`query`) `string` _requerido_ — The Ad Account id. Only 1 id is permitted.
- **currency** (`query`) `string` · valores: `usd`, `user_currency` · default: `user_currency`
- **dayOfAttribution** (`query`) `boolean` · default: `False`
- **scientificDaysRange** (`query`) `integer` · default: `30`
- **sourceConfiguration** (`query`) `string` · valores: `all_sources`, `only_organic`, `only_paid`, `prioritize_organic`, `prioritize_paid`
- **adLevelDateGroupingOption** (`query`) `string` · valores: `ad_account`, `day`, `week`, `month`, `year` · default: `ad_account`
- **ignoreRecurringSales** (`query`) `boolean` · default: `False`
- **forecastingOption** (`query`) `string` · valores: `first_sale`, `total_sales` · default: `first_sale`
- **windowAttributionDaysRange** (`query`) `integer` · default: `0`
- **newCustomerConfiguration** (`query`) `string` · valores: `all_customers`, `only_returning_customers`, `only_unique_customers`

### Respuestas

**`200`** — Successful response.

- **result** `object[]`
  - `array` de:
    - `object` de claves libres
- **request_id** `string`

```json
{
  "result": [
    {
      "id": "205044496234",
      "sales": 64,
      "leads": 0,
      "total_revenue": 9283.41,
      "cost": 9172.25,
      "cost_per_sale": 143.32,
      "start_date": "2020-05-12T10:00:00",
      "end_date": "2021-04-13T10:00:00"
    }
  ],
  "request_id": "d9031a3780c14ecdb8ca3af5cd26bc91"
}
```

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/attribution/marginal-cac-curve`

**Get Marginal CAC Curve**

Computes, from the account's own daily spend history, what happens to the cost of acquiring the next customer at every observed daily spend level for the entity a single `id` identifies at the given `level` — and past which spend level the next dollar is wasted. Days in the range are grouped into equal-count buckets by ascending daily spend; each bucket carries its average CAC and the marginal CAC versus the previous cheaper bucket (the incremental spend per incremental customer). The saturation point is the first spend level from which every remaining level is wasteful — its marginal CAC exceeds the ceiling, or the extra spend produced no extra customers. Degraded data returns a partial curve explained through `notes` rather than an error. **Attribution model.** This endpoint always measures on the click date and with rebills included, and defaults to `first_click`: a customer is credited to the first ad that touched them, so each daily point relates a spend level to the acquisitions it caused and recurring revenue rolls up to the acquiring ad — a cost-of-acquisition curve. Passing `attributionModel=last_click` credits the customer to the click that immediately preceded the purchase instead, turning the result into a cost-of-*closing* curve: what it costs the entity to close the next customer. Use it for retargeting and bottom-of-funnel entities, whose real contribution first-click hands over to whichever ad acquired the customer earlier. Read a prospecting entity that way and the curve distorts, since most of the customers it acquired were closed elsewhere. **The ceiling.** Defaults to the entity's realized LTV for the requested window — break-even, with no margin — and `ceilingBasis` states which rule produced it. Note the realized LTV groups customers by what they bought, not by how they retain, so two traffic sources whose customers buy the same products report the same LTV even if their rebill behavior differs. At the `account` level no LTV is available, so the ceiling is the caller's `cacCeiling` or none. **Notes:** - `id` and `level` are both required, and the id must belong to the level given. - Campaign-level reporting is available on Meta, Google and LinkedIn. The remaining platforms have no campaign level, so report those at the `ad` or `source_link` level. - An id that does not belong to the account returns a `400` rather than a curve of zeros. - Customers are attributed to their click date, so the most recent days may undercount customers whose conversions have not happened yet.

tags: `Attribution`

### Parámetros

- **id** (`query`) `string` _requerido_ — Id of the entity to report on, as the ad platform issues it. It must belong to the given `level`.
- **level** (`query`) `string` _requerido_ — Granularity the id refers to. - `ad`: a single ad. - `source_link`: an ad set on Meta, an ad group elsewhere. The level most tracked data sits at. - `campaign`: a campaign, whose contained ads are resolved and aggregated. - `account`: a whole ad account. Day-grouped ranges are capped at 90 days on this level. · valores: `ad`, `source_link`, `campaign`, `account`
- **startDate** (`query`) `string` — ISO 8601 starting date of the history. Defaults to 90 days before `endDate`.
- **endDate** (`query`) `string` — ISO 8601 ending date of the history. Defaults to today.
- **ltvWindow** (`query`) `string` — Realized LTV window used as the break-even ceiling when `cacCeiling` is absent. Rejected at the `account` level, which carries no LTV — provide `cacCeiling` there instead. · valores: `30_days`, `60_days`, `90_days`, `6_months`, `1_year` · default: `90_days`
- **cacCeiling** (`query`) `number` — Maximum acceptable cost to acquire one customer, chosen by the caller (e.g. a fraction of LTV that preserves margin). Overrides the LTV break-even ceiling. Must be zero or positive.
- **attributionModel** (`query`) `string` — Which model credits a customer to the entity. - `first_click`: the customer belongs to the first ad that touched them — a cost-of-acquisition curve, and the way to read prospecting entities. - `last_click`: the customer belongs to the click that immediately preceded the purchase — a cost-of-closing curve, and the way to read retargeting and bottom-of-funnel entities. · valores: `first_click`, `last_click` · default: `first_click`

### Respuestas

**`200`** — Successful response. `curve` is ordered by ascending daily spend level; `saturationPoint` is null when saturation was not reached in the observed range. `notes` explains a partial curve: `NO_SPEND_DATA`, `NO_CUSTOMERS`, `INSUFFICIENT_DATA`, `LTV_CEILING_UNAVAILABLE`. `ceilingBasis` is `CALLER_PROVIDED` or `LTV_BREAKEVEN`, and `ltvWindow` is null unless the ceiling came from the LTV break-even rule. `name` is null at the `account` level, whose rows are date ranges rather than a named entity.

- **request_id** `string`
- **result** `object` — The curve computed for the entity reported on.

```json
{
  "request_id": "cb0e1b0e5a7f4c0b9f0e1b0e5a7f4c0b",
  "result": {
    "id": "23851234567890123",
    "level": "SOURCE_LINK",
    "name": "YT-LongForm-Founder",
    "startDate": "2020-05-12",
    "endDate": "2020-08-10",
    "attributionModel": "FIRST_CLICK",
    "daysSampled": 84,
    "cacCeiling": 52.0,
    "ceilingBasis": "CALLER_PROVIDED",
    "ltvWindow": null,
    "curve": [
      {
        "spendPerDay": 812.4,
        "days": 28,
        "newCustomers": 594,
        "avgCac": 38.29,
        "marginalCac": null
      },
      {
        "spendPerDay": 1490.1,
        "days": 28,
        "newCustomers": 941,
        "avgCac": 44.33,
        "marginalCac": 54.68
      },
      {
        "spendPerDay": 2274.75,
        "days": 28,
        "newCustomers": 1088,
        "avgCac": 58.54,
        "marginalCac": 149.46
      }
    ],
    "saturationPoint": {
      "efficientSpendPerDay": 1490.1,
      "saturatedSpendPerDay": 2274.75,
      "reason": "MARGINAL_CAC_ABOVE_CEILING"
    },
    "notes": []
  }
}
```

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/attribution/roas`

**Get ROAS**

> [!NOTE] > **Required role** — Get ROAS Retrieves the cash actually collected by the entity a single `id` identifies at the given `level`, against its ad spend. A narrow preset over `GET /api/v1.0/attribution`: the reporting level is resolved from the id and the requested level, so the platform never has to be supplied and the caller does not need to know which reporting level each platform's ads, ad sets or campaigns report at. The metric set, attribution model and row grouping are fixed. Rebills are already counted inside `total_revenue`, and sales are credited to the click that drove them however long they took to land. `roas` is revenue over spend, so break-even is `1.0` rather than `0`. **Attribution model.** This endpoint always measures under `last_click`, and the model is not selectable. That matters for reading the number: under `last_click` a sale is credited to the entity whose click came *last* before the purchase, so the same entity over the same range would report a different `roas` under a first-click model. Use `GET /api/v1.0/attribution` instead to choose the attribution model, to pick reporting levels or metrics, to group results by date, or to report on several entities at once. **Notes:** - `id` and `level` are both required, and the id must belong to the level given. - Campaign-level reporting is available on Meta, Google and LinkedIn. The remaining platforms have no campaign level, so report those at the `ad` or `source_link` level. - An id that does not belong to the account returns a `400` rather than a report of zeros.

tags: `Attribution`

### Parámetros

- **id** (`query`) `string` _requerido_ — Id of the entity to report on, as the ad platform issues it. It must belong to the given `level`.
- **level** (`query`) `string` _requerido_ — Granularity the id refers to. - `ad`: a single ad. - `source_link`: an ad set on Meta, an ad group elsewhere. The level most tracked data sits at. - `campaign`: a campaign, whose contained ads are resolved and aggregated. - `account`: a whole ad account. · valores: `ad`, `source_link`, `campaign`, `account`
- **startDate** (`query`) `string` _requerido_ — ISO 8601 starting date.
- **endDate** (`query`) `string` _requerido_ — ISO 8601 ending date.
- **basis** (`query`) `string` — Which date the range filters on. - `click_date`: credits the clicks made inside the range, however long their sales took to land afterwards. Since the endpoint measures under `last_click`, the click it dates a sale by is the *last* one before the purchase. - `sale_date`: counts only the revenue collected inside the range. · valores: `click_date`, `sale_date` · default: `click_date`

### Respuestas

**`200`** — Successful response.

- **request_id** `string`
- **result** `object` — The single entity reported on. Absent when it has no row for the range.

```json
{
  "request_id": "cb0e1b0e5a7f4c0b9f0e1b0e5a7f4c0b",
  "result": {
    "id": "23851234567890123",
    "roas": 3.42,
    "new_customers_roas": 2.81,
    "revenue": 8200.0,
    "recurring_revenue": 1350.0,
    "total_revenue": 9550.0,
    "cost": 2792.4,
    "unique_sales": 74,
    "unique_customers": 61,
    "reported_result": 88,
    "reported_vs_revenue": 1120.0
  }
}
```

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/calls`

**Retrieve Calls**

> [!NOTE] > **Required role** — Get Calls Search and retrieve calls by date, email, lead id, product tag or id.

tags: `Calls`

### Parámetros

- **ids** (`query`) `string` — Array of call ids. At most 50 can be provided.
- **emails** (`query`) `string` — Array of emails or prefixes. At most 50 can be provided.
- **leadIds** (`query`) `string` — Array of leadIds. At most 50 can be provided.
- **productTags** (`query`) `string` — Array of product tags. At most 20 can be provided.
- **fromDate** (`query`) `string` — ISO 8601 date. Only calls after this date will be retrieved.
- **toDate** (`query`) `string` — ISO 8601 date. Only calls before this date will be retrieved.
- **pageSize** (`query`) `integer` — Maximum number of calls per page. Range 1-250.
- **pageId** (`query`) `string` — ID of the next page, taken from the `nextPageId` of a previous response. Omit it to fetch the first page. An invalid or expired pagination cursor is rejected with `400 Bad Request`.
- **qualified** (`query`) `boolean` — Filter by qualified status.
- **qualificationStages** (`query`) `string` — Array of qualification stage names. At most 50 can be provided.

### Respuestas

**`200`** — Successful response.

- **result** `Call[]`
  - `array` de:
    - **id** `string`
    - **tag** `string`
    - **qualified** `boolean`
    - **name** `string`
    - **externalId** `string`
    - **score** `number`
    - **creationDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **state** `CallState` · valores: `QUALIFIED`, `UNQUALIFIED`, `CANCELLED`, `NO_SHOW`
    - **qualification** `object`
      - **name** `string`
      - **oldName** `string`
    - **lead** `Lead`
      - **email** `string`
      - **id** `string`
      - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
      - **lastUpdatedDate** `string`
      - **tags** `string[]`
        - `array` de:
      - **ips** `string[]`
        - `array` de:
      - **phoneNumbers** `string[]`
        - `array` de:
      - **firstName** `string`
      - **lastName** `string`
      - **provider** `Provider`
        - **id** `string` — ID of lead in external platform.
        - **integration** `object`
          - **name** `string`
          - **type** `string`
          - **id** `string` — Account ID of the integration.
      - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
      - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
    - **firstSource** `Attribution`
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
    - **lastSource** `Attribution`
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/calls`

**Create Call**

> [!NOTE] > **Required role** — Create Calls > > **Asynchronous** — effect is not immediate; changes typically appear within ~10 seconds. Create a call with all necessary information. Additionally, creates the lead if not already present.

tags: `Calls`

### Request body — `application/json` (requerido)

- **name** `string` _requerido_ — Name of the call.
- **email** `string` _requerido_ — Email associated with the lead.
- **firstName** `string`
- **lastName** `string`
- **leadIps** `string[]`
  - `array` de:
- **stage** `string`
- **phoneNumbers** `string | string[]`
  - _uno de:_
    - **string**
    - **string[]**
      - `array` de:
- **externalId** `string` — Unique identifier from the external integration. If a call with the same externalId exists, it will be updated.
- **id** `string` — DEPRECATED: Use externalId instead.
- **date** `string` — ISO 8601 date when the call was processed.
- **qualified** `boolean` — DEPRECATED: Use state instead.
- **qualification** `string` — Custom name of the qualification to apply to the call.
- **state** `CallState` · valores: `QUALIFIED`, `UNQUALIFIED`, `CANCELLED`, `NO_SHOW`

```json
{
  "name": "Call 1",
  "email": "john@doe.com",
  "firstName": "John",
  "lastName": "Doe",
  "leadIps": [],
  "stage": "SQL",
  "phoneNumbers": [],
  "date": "2021-04-16T20:35:00",
  "qualification": "Qualified",
  "state": "QUALIFIED"
}
```

### Respuestas

**`200`** — Call created successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `PUT /api/v1.0/calls`

**Update Calls**

> [!NOTE] > **Required role** — Update Calls > > **Asynchronous** — effect is not immediate; changes typically appear within ~5 minutes. Update calls by their ids.

tags: `Calls`

### Parámetros

- **ids** (`query`) `string` — Array of call ids. At most 50 can be provided.
- **externalIds** (`query`) `string` — Array of call externalIds. At most 50 can be provided.
- **name** (`query`) `string` _requerido_ — Call name to assign.
- **qualification** (`query`) `string` — Call qualification to assign.
- **state** (`query`) `CallState` — Call state to assign.
- **qualified** (`query`) `boolean` — DEPRECATED: Use state instead.

### Respuestas

**`200`** — Calls updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `DELETE /api/v1.0/calls/{id}`

**Delete Call**

> [!NOTE] > **Required role** — Delete Calls > > **Asynchronous** — effect is not immediate; changes typically appear within ~5 minutes. Delete a call by its id.

tags: `Calls`

### Parámetros

- **id** (`path`) `string` _requerido_ — Call id to be deleted.

### Respuestas

**`200`** — Call deleted successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/carts`

**Retrieve Carts**

> [!NOTE] > **Required role** — Get Carts Search and retrieve carts by creation date, purchased state (whether the cart has an associated order or not), email and lead id.

tags: `Carts`

### Parámetros

- **emails** (`query`) `string` — Array of emails or prefixes. At most 50 can be provided.
- **leadIds** (`query`) `string` — Array of leadIds. At most 50 can be provided.
- **purchased** (`query`) `boolean` — Filter by purchased state. `true` returns only purchased carts (with orderId); `false` returns carts without orderId.
- **fromDate** (`query`) `string` — ISO 8601 date. Only carts whose creation date is more recent than this will be retrieved.
- **toDate** (`query`) `string` — ISO 8601 date. Only carts whose creation date is older than this will be retrieved.
- **pageSize** (`query`) `integer` — Maximum number of carts per page. Range 1-250.
- **pageId** (`query`) `string` — ID of the next page, taken from the `nextPageId` of a previous response. Omit it to fetch the first page. An invalid or expired pagination cursor is rejected with `400 Bad Request`.

### Respuestas

**`200`** — Successful response.

- **result** `Cart[]`
  - `array` de:
    - **id** `string`
    - **orderId** `string` — Only present if cart was purchased.
    - **creationDate** `string` — Cart creation date, in UTC.
    - **events** `integer`
    - **lead** `LeadWithConsent`
      - **email** `string`
      - **id** `string`
      - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
      - **lastUpdatedDate** `string`
      - **tags** `string[]`
        - `array` de:
      - **ips** `string[]`
        - `array` de:
      - **phoneNumbers** `string[]`
        - `array` de:
      - **firstName** `string`
      - **lastName** `string`
      - **provider** `Provider`
        - **id** `string` — ID of lead in external platform.
        - **integration** `object`
          - **name** `string`
          - **type** `string`
          - **id** `string` — Account ID of the integration.
      - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
      - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
      - **adOptimizationConsent** `AdOptimizationConsent` · valores: `GRANTED`, `DENIED`, `UNSPECIFIED`
    - **provider** `Provider`
      - **id** `string` — ID of lead in external platform.
      - **integration** `object`
        - **name** `string`
        - **type** `string`
        - **id** `string` — Account ID of the integration.
    - **products** `Product[]`
      - `array` de:
        - **id** `string` — Product id (its tracking pixel).
        - **name** `string`
        - **tag** `string`
        - **sku** `string`
        - **price** `number`
        - **customCost** `number` — Cost of goods of the product, used in profit and ROAS reporting.
        - **recurring** `boolean`
        - **callProduct** `boolean`
        - **category** `string` — Category name.
    - **firstSource** `Attribution`
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
    - **lastSource** `Attribution`
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/carts`

**Create Cart**

> [!NOTE] > **Required role** — Create Carts > > **Asynchronous** — effect is not immediate; changes typically appear within ~10 seconds. Create a cart. Additionally, creates the lead if not already present.

tags: `Carts`

### Request body — `application/json` (requerido)

- **cartId** `string` — ID of the cart. A default one will be created if not included.
- **email** `string`
- **firstName** `string`
- **lastName** `string`
- **leadIps** `string[]`
  - `array` de:
- **phoneNumbers** `string | string[]`
  - _uno de:_
    - **string**
    - **string[]**
      - `array` de:
- **date** `string` — ISO 8601 date. Timezone recommended.
- **priceFormat** `string` · valores: `DECIMAL`, `INTEGER` · default: `DECIMAL`
- **currency** `string`
- **items** `CartItem[]` _requerido_
  - `array` de:
    - **name** `string` _requerido_
    - **price** `number` _requerido_
    - **externalId** `string`
    - **quantity** `number` · default: `1`
    - **sku** `string` — Unique product reference code.
    - **isRebill** `boolean` — If true, the sale is marked as recurring even if it's the first one.

```json
{
  "cartId": "d49b708b3df50505869ca54f026e7c97a4959b587605f14f91c7e289de9f80bd",
  "email": "john@doe.com",
  "firstName": "John",
  "lastName": "Doe",
  "date": "2021-09-06T12:00:12Z",
  "currency": "USD",
  "items": [
    {
      "name": "T-shirt-blue",
      "price": 9.5,
      "externalId": "23456798",
      "quantity": 3,
      "sku": "DEPOR-XYZ-BLN-41",
      "isRebill": false
    }
  ],
  "priceFormat": "DECIMAL",
  "phoneNumbers": [
    "2345678901"
  ],
  "leadIps": [
    "70.107.190.180"
  ]
}
```

### Respuestas

**`200`** — Cart created successfully.

- **request_id** `string`
- **result** `string`
- **message** `string[]`
  - `array` de:

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `PUT /api/v1.0/carts`

**Update Cart**

> [!NOTE] > **Required role** — Update Carts > > **Asynchronous** — effect is not immediate; changes typically appear within ~5 minutes. Update a cart and its corresponding Lead.

tags: `Carts`

### Request body — `application/json` (requerido)

- **cartId** `string` _requerido_ — ID of the cart to update.
- **items** `CartItem[]` _requerido_
  - `array` de:
    - **name** `string` _requerido_
    - **price** `number` _requerido_
    - **externalId** `string`
    - **quantity** `number` · default: `1`
    - **sku** `string` — Unique product reference code.
    - **isRebill** `boolean` — If true, the sale is marked as recurring even if it's the first one.
- **email** `string`
- **firstName** `string`
- **lastName** `string`
- **leadIps** `string[]`
  - `array` de:
- **phoneNumbers** `string[]`
  - `array` de:
- **date** `string`
- **priceFormat** `string` · valores: `DECIMAL`, `INTEGER` · default: `DECIMAL`
- **currency** `string`

```json
{
  "cartId": "d49b708b3df50505869ca54f026e7c97a4959b587605f14f91c7e289de9f80bd",
  "email": "john@doe.com",
  "date": "2021-09-06T12:00:12Z",
  "currency": "USD",
  "items": [
    {
      "name": "T-shirt-red",
      "price": 9.5,
      "externalId": "23456333",
      "quantity": 1,
      "sku": "DEPOR-XYZ-RED-41",
      "isRebill": false
    }
  ],
  "priceFormat": "DECIMAL"
}
```

### Respuestas

**`200`** — Cart updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/clicks`

**Create Click**

> [!NOTE] > **Required role** — Create Clicks > > **Asynchronous** — effect is not immediate; changes typically appear within ~10 seconds. Creates a click with the URL the user clicked on and a session id representing the potential lead session. Optionally includes an email to create a lead, and ad data.

tags: `Clicks`

### Request body — `application/json` (requerido)

- **referrerUrl** `string` _requerido_ — The URL for the click.
- **sessionId** `string` — Unique string representing the lead session.
- **previousUrl** `string`
- **userAgent** `string`
- **ip** `string`
- **sourceLinkTag** `string` — A `@tag` representing the ad. Must start with `@`.
- **isOrganic** `boolean`
- **integrationType** `string` — Subset of `AdspendType` accepted when creating a click. · valores: `GOOGLE`, `GOOGLE_V2`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`
- **adSourceId** `string` — Id of the group of ads. Required if `integrationType` is present. - Facebook: adset id · Google: campaign id · TikTok: ad group id · Snapchat: ad squad id · LinkedIn: campaign id
- **adspendAdId** `string` — Id of the ad. Only for Facebook and Google.
- **adSourceClickId** `string` — Click id in the ad platform. Used for offline conversions (Facebook, Google, TikTok, Snapchat).
- **email** `string`
- **phones** `string | string[]`
  - _uno de:_
    - **string**
    - **string[]**
      - `array` de:
- **tag** `string` — Tag to apply to the lead.
- **date** `string` — Date when the click was made. Allowed formats: `yyyy-MM-ddTHH:mm:ssZ`, `yyyy-MM-ddTHH:mmZ`, `yyyy-MM-ddTHH:mm:ss+HH:mm`, `yyyy-MM-ddTHH:mm+HH:mm`, `yyyy-MM-ddTHH:mm:ss`, `yyyy-MM-ddTHH:mm`, `yyyy-MM-dd`

```json
{
  "sessionId": "RWp7VmL3nlAi6zdG0KKQ",
  "referrerUrl": "landing.page.com",
  "previousUrl": "previous.url",
  "userAgent": "Mozilla/5.0 (X11; Linux x86_64)",
  "ip": "0.0.0.0",
  "sourceLinkTag": "@facebook-post",
  "isOrganic": true
}
```

### Respuestas

**`200`** — Click created successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/custom-costs`

**Retrieve Custom Costs**

> [!NOTE] > **Required role** — Get Custom Costs Retrieve custom costs. A cost matches the date window when its active range (from startDate to endDate, or open-ended when no endDate is set) overlaps the fromDate/toDate window. Use the returned id to update or delete a cost.

tags: `Custom Costs`

### Parámetros

- **ids** (`query`) `string` — Array of custom cost ids. At most 50 can be provided.
- **fromDate** (`query`) `string` — ISO 8601 date. Only costs active on or after this date will be retrieved.
- **toDate** (`query`) `string` — ISO 8601 date. Only costs active on or before this date will be retrieved.
- **pageSize** (`query`) `integer` — Maximum number of custom costs per page. Range 1-250. Defaults to 50.
- **pageId** (`query`) `string` — ID of the next page.

### Respuestas

**`200`** — Successful response.

- **result** `CustomCost[]`
  - `array` de:
    - **id** `string`
    - **name** `string`
    - **cost** `number`
    - **frequency** `string` · valores: `DAILY`, `ONE_TIME`, `MONTHLY`
    - **startDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **endDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **tags** `string[]`
      - `array` de:
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/custom-costs`

**Create Custom Cost**

> [!NOTE] > **Required role** — Create Custom Costs > > **Asynchronous** — effect is not immediate; changes typically appear within ~10 seconds. Create a custom cost with all necessary information.

tags: `Custom Costs`

### Request body — `application/json` (requerido)

- **name** `string` — Descriptive label for the cost.
- **startDate** `string` _requerido_ — ISO 8601 start date.
- **endDate** `string` — ISO 8601 end date.
- **frequency** `string` _requerido_ · valores: `DAILY`, `ONE_TIME`
- **cost** `number` _requerido_ — Must be greater than zero. Currency matches Hyros account settings.
- **tags** `string[]` _requerido_ — Source tags to assign the costs to. Maximum 10.
  - `array` de:

```json
{
  "name": "Monthly Agency Fee",
  "startDate": "2024-12-25T00:00:00.000Z",
  "endDate": "2024-12-20T00:00:00.000Z",
  "frequency": "DAILY",
  "tags": [
    "@instagram",
    "@facebook"
  ],
  "cost": 999.5
}
```

### Respuestas

**`200`** — Custom cost created successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `DELETE /api/v1.0/custom-costs/{id}`

**Delete Custom Cost**

> [!NOTE] > **Required role** — Delete Custom Costs Delete a custom cost by its id.

tags: `Custom Costs`

### Parámetros

- **id** (`path`) `string` _requerido_ — Custom cost id to be deleted.

### Respuestas

**`200`** — Custom cost deleted successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `PUT /api/v1.0/custom-costs/{id}`

**Update Custom Cost**

> [!NOTE] > **Required role** — Update Custom Costs Update a custom cost by its id. This is a full replacement: every field must be provided, and any omitted optional field is cleared. Costs created from the Hyros UI with a MONTHLY frequency are returned by the retrieve endpoint, but the API only accepts DAILY or ONE_TIME, so a MONTHLY cost cannot be edited through this endpoint without changing its frequency.

tags: `Custom Costs`

### Parámetros

- **id** (`path`) `string` _requerido_ — Id of the custom cost to update.

### Request body — `application/json` (requerido)

- **name** `string` — Descriptive label for the cost.
- **startDate** `string` _requerido_ — ISO 8601 start date.
- **endDate** `string` — ISO 8601 end date.
- **frequency** `string` _requerido_ · valores: `DAILY`, `ONE_TIME`
- **cost** `number` _requerido_ — Must be greater than zero. Currency matches Hyros account settings.
- **tags** `string[]` _requerido_ — Source tags to assign the costs to. Maximum 10.
  - `array` de:

```json
{
  "name": "Monthly Agency Fee",
  "startDate": "2024-12-25T00:00:00.000Z",
  "endDate": "2025-01-25T00:00:00.000Z",
  "frequency": "DAILY",
  "tags": [
    "@instagram",
    "@facebook"
  ],
  "cost": 1299.5
}
```

### Respuestas

**`200`** — Custom cost updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/keywords`

**Retrieve Keywords**

> [!NOTE] > **Required role** — Get Attribution List all keywords, or those associated with a specific Google Ad Group Id.

tags: `Keywords`

### Parámetros

- **adgroupId** (`query`) `string` — The ad group id.
- **pageSize** (`query`) `integer` — Between 1 and 250.
- **pageId** (`query`) `string`

### Respuestas

**`200`** — Successful response.

- **result** `object[]`
  - `array` de:
    - **id** `string`
    - **name** `string`
    - **adGroupId** `string`
    - **adGroupName** `string`
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `DELETE /api/v1.0/leads`

**Delete Lead**

> [!NOTE] > **Required role** — Delete Leads > > **Asynchronous** — the erasure applies immediately, but the lead typically takes ~5 minutes to disappear from `GET /leads`. Permanently delete a lead and its personal data. Provide one of email or id to identify the lead. Personal data is redacted, and phone numbers, sales and tracking data are deleted while subscriptions are cancelled. The lead's email address and phone numbers are also **blacklisted**, so later events carrying them are discarded instead of re-creating the lead. This cannot be undone through the API.

tags: `Leads`

### Parámetros

- **email** (`query`) `string` — Email used to search for the lead to delete.
- **id** (`query`) `string` — ID used to search for the lead to delete.

### Respuestas

**`200`** — Lead deleted successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/leads`

**Retrieve Leads**

> [!NOTE] > **Required role** — Get Leads Search and retrieve leads by their join date, last updated date, email, phone number or id.

tags: `Leads`

### Parámetros

- **ids** (`query`) `string` — Array of lead ids. At most 50 can be provided.
- **emails** (`query`) `string` — Array of emails or email prefixes. At most 50 can be provided.
- **phones** (`query`) `string` — Array of phone numbers. At most 50 can be provided.
- **tags** (`query`) `string` — Array of tag names. Leads matching any of the provided tags will be retrieved. Tags are matched exactly, including any prefix (e.g. `!Tag1`). At most 50 can be provided.
- **stage** (`query`) `string` — Array of stage names. Leads matching any of the provided stages will be retrieved. Stage names are matched case-insensitively. At most 50 can be provided.
- **fromDate** (`query`) `string` — ISO 8601 date. Only leads whose join date is more recent than this will be retrieved.
- **toDate** (`query`) `string` — ISO 8601 date. Only leads whose join date is older than this will be retrieved.
- **updatedFromDate** (`query`) `string` — ISO 8601 date. Only leads updated on or after this date will be retrieved. Use it to fetch just the leads that changed since your last request.
- **updatedToDate** (`query`) `string` — ISO 8601 date. Only leads updated on or before this date will be retrieved.
- **pageSize** (`query`) `integer` — Maximum number of leads per page. Range 1-250.
- **pageId** (`query`) `string` — ID of the next page, taken from the `nextPageId` of a previous response. Omit it to fetch the first page. An invalid or expired pagination cursor is rejected with `400 Bad Request`.

### Respuestas

**`200`** — Successful response.

- **result** `LeadWithStage[]`
  - `array` de:
    - **email** `string`
    - **id** `string`
    - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
    - **lastUpdatedDate** `string`
    - **tags** `string[]`
      - `array` de:
    - **ips** `string[]`
      - `array` de:
    - **phoneNumbers** `string[]`
      - `array` de:
    - **firstName** `string`
    - **lastName** `string`
    - **provider** `Provider`
      - **id** `string` — ID of lead in external platform.
      - **integration** `object`
        - **name** `string`
        - **type** `string`
        - **id** `string` — Account ID of the integration.
    - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
    - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
    - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
    - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
    - **adOptimizationConsent** `AdOptimizationConsent` · valores: `GRANTED`, `DENIED`, `UNSPECIFIED`
    - **currentStage** `LeadStage` — Present only when the lead has a stage applied.
      - **name** `string` — Name of the stage.
      - **date** `string` — Date the stage was applied (ISO-8601 with timezone offset). Omitted when unavailable.
- **nextPageId** `string`
- **request_id** `string`

```json
{
  "result": [
    {
      "email": "lead1@email.com",
      "id": "40b5af5444756c2b5e666fcb658affd2a4b455bce3711c43f88763147381e368",
      "creationDate": "2023-01-04T04:36:41-05:00",
      "lastUpdatedDate": "2023-06-10T09:12:00-05:00",
      "tags": [
        "$ettst"
      ],
      "adOptimizationConsent": "GRANTED",
      "currentStage": {
        "name": "stage1",
        "date": "2023-01-06T09:12:00-05:00"
      },
      "firstSource": {
        "sourceLinkId": "7bc217f372eab0efa188bb5b05be87460976e68e03b801d53c39bb4ed54c9750",
        "name": "Facebook Adset",
        "tag": "@facebook-adset",
        "clickDate": "2023-01-03T22:14:07-05:00"
      },
      "lastSource": {
        "sourceLinkId": "12cc9f521ba37e33d624927ea7088d91a6b2e39bf1466c281120cde22a4bee84",
        "name": "Facebook Adset 2",
        "tag": "@facebook-adset-2",
        "clickDate": "2023-01-04T01:02:59-05:00"
      },
      "originLead": {
        "email": "originlead@email.com",
        "id": "9c1e5b0a4f7d2c8e6b3a1f0d9e8c7b6a5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a",
        "creationDate": "2022-12-30T09:12:00-05:00",
        "isOriginLead": true,
        "tags": [
          "$origin"
        ]
      }
    },
    {
      "email": "lead2@email.com",
      "id": "b5981e8ce87d08773a4ggre985d2d9949153c6fb55cb5075291941d9f23f4282",
      "creationDate": "2023-01-04T02:37:45-05:00",
      "ips": [
        "1.2.3.4"
      ],
      "phoneNumbers": [
        "202-555-0184"
      ],
      "adOptimizationConsent": "UNSPECIFIED"
    }
  ],
  "nextPageId": "568fd86587125f55117505312dc72bb8b71e9647a25e5b142d3f28bccd228360",
  "request_id": "e47941e7104gtrgtrgtr24d0884c6df09407e76fd"
}
```

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/leads`

**Create Lead**

> [!NOTE] > **Required role** — Create Leads > > **Asynchronous** — effect is not immediate; changes typically appear within ~10 seconds. Create or Update leads and their tags. If the applied Tag matches with that of a Product, a sale will be generated for said lead, only if it didn't already have the tag.

tags: `Leads`

### Request body — `application/json` (requerido)

- **email** `string` — Email of the lead. Required if no phone number is provided. If only a phone number is provided, a placeholder email `<phone>@hyrosapi.com` is generated and returned as the lead's email.
- **firstName** `string`
- **lastName** `string`
- **tags** `string[]` — Tags to apply to the lead.
  - `array` de:
- **tagsDate** `string` — Optional ISO-8601 date (`2023-05-01T10:00:00-03:00`) applied as the assignment date of **every** tag in `tags`, to backdate historical tags during imports, migrations or CRM syncs. Defaults to the current time when omitted. Cannot be in the future. To assign tags with different dates, send one request per date. If a tag generates a sale or a source attribution, those are backdated too.
- **leadIps** `string[]` — IPs of the lead for ad attribution.
  - `array` de:
- **phoneNumbers** `string | string[]` — Phone numbers of the lead. Required if no email is provided.
  - _uno de:_
    - **string**
    - **string[]**
      - `array` de:
- **stage** `string` — Stage to apply to the lead. On create the stage is a plain string; on update (`PUT /leads`) it is set via the `leadStage` object (`{name, date}`) instead.
- **adOptimizationConsent** `AdOptimizationConsent` · valores: `GRANTED`, `DENIED`, `UNSPECIFIED`

```json
{
  "email": "John@doe.com",
  "firstName": "John",
  "lastName": "Doe",
  "tags": [
    "!Tag1"
  ],
  "tagsDate": "2023-05-01T10:00:00-03:00",
  "leadIps": [
    "172.8.105.28"
  ],
  "phoneNumbers": [
    "1105385366"
  ],
  "stage": "MQL",
  "adOptimizationConsent": "GRANTED"
}
```

### Respuestas

**`200`** — Lead created/updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `PUT /api/v1.0/leads`

**Update Lead**

> [!NOTE] > **Required role** — Update Leads > > **Asynchronous** — effect is not immediate; changes typically appear within ~5 minutes. Update leads and their tags. Tag assignments can be backdated with the optional `tagsDate` field (ISO-8601). It applies as the assignment date of **every** tag in `tags`, so historical tags keep an accurate timeline during imports, migrations or CRM syncs; it defaults to the current time when omitted and cannot be in the future. To assign tags with different dates, send one request per date. Tags the lead already has are ignored (their existing date is not changed). If a tag generates a sale or a source attribution, those are backdated too.

tags: `Leads`

### Parámetros

- **email** (`query`) `string` — Email used to search for the lead to update.
- **id** (`query`) `string` — ID used to search for the lead to update.
- **phone** (`query`) `string` — Phone used to search for the lead to update.

### Request body — `application/json` (requerido)

- **email** `string` — New email.
- **firstName** `string`
- **lastName** `string`
- **tags** `string[]` — Tags to add to the lead.
  - `array` de:
- **tagsDate** `string` — Optional ISO-8601 date applied as the assignment date of every tag in `tags` (defaults to now, cannot be in the future). Tags the lead already has are ignored, not re-dated. For tags with different dates, send one request per date.
- **removeTags** `string[]` — Tags to remove from the lead.
  - `array` de:
- **leadIps** `string[]`
  - `array` de:
- **phoneNumbers** `string[]`
  - `array` de:
- **adOptimizationConsent** `AdOptimizationConsent` · valores: `GRANTED`, `DENIED`, `UNSPECIFIED`
- **leadStage** `object` — Stage to apply to the lead on update. Create (`POST /leads`) uses a plain `stage` string instead.
  - **name** `string`
  - **date** `string`

```json
{
  "email": "John@doe.com",
  "firstName": "John",
  "lastName": "Doe",
  "tags": [
    "!Tag1"
  ],
  "tagsDate": "2023-05-01T10:00:00-03:00",
  "removeTags": [
    "!Tag2"
  ],
  "leadIps": [
    "172.8.105.28"
  ],
  "phoneNumbers": [
    "1105385366"
  ],
  "adOptimizationConsent": "GRANTED",
  "leadStage": {
    "name": "leadStageNameCINCO",
    "date": "2025-11-13T14:00:00-03:00"
  }
}
```

### Respuestas

**`200`** — Lead updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/leads/clicks`

**Retrieve Lead Clicks**

> [!NOTE] > **Required role** — Get Lead Clicks Retrieve clicks belonging to a lead. Either `leadId` or `email` must be provided.

tags: `Leads`

### Parámetros

- **leadId** (`query`) `string` — The lead id.
- **email** (`query`) `string` — The lead email.
- **pageSize** (`query`) `integer` — Maximum number of clicks per page. Between 1 and 250.
- **pageId** (`query`) `string` — ID of the next page.
- **fromDate** (`query`) `string` — ISO 8601 date. Only clicks dated after this will be retrieved.
- **toDate** (`query`) `string` — ISO 8601 date. Only clicks dated before this will be retrieved.

### Respuestas

**`200`** — Successful response.

- **result** `object[]`
  - `array` de:
    - **id** `string`
    - **date** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **trackedUrl** `string`
    - **page** `string`
    - **previousUrl** `string`
    - **adspendType** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
    - **sourceLinkName** `string`
    - **ip** `string`
    - **agent** `string`
    - **cartId** `string`
    - **deduplicationParams** `object`
    - **adSpendId** `integer`
    - **parsedParameters** `object`
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/leads/journey`

**Retrieve Leads Journey**

> [!NOTE] > **Required role** — Get Lead Journey Retrieve the details about leads journeys using lead ids and/or emails. At least one of `ids` or `emails` must be provided. Emails are matched exactly (case-insensitive); an email may resolve to more than one lead, in which case one journey is returned per matched lead. Each journey includes the lead's sales, calls, carts, subscriptions and linked leads. Set `includeEvents=true` to additionally return a chronological `journey` array of events (sales, calls, emails, clicks, page views, etc.).

tags: `Leads`

### Parámetros

- **ids** (`query`) `string` — Array of lead ids. At most 50 can be provided.
- **emails** (`query`) `string` — Array of lead emails, matched exactly (case-insensitive). At most 50 can be provided.
- **includeEvents** (`query`) `boolean` — When `true`, each returned journey includes a `journey` array of chronological events (sales, calls, emails, clicks, page views, etc.). Defaults to `false`. · default: `False`

### Respuestas

**`200`** — Successful response.

- **result** `LeadJourney[]`
  - `array` de:
    - **lead** `LeadWithStage`
      - **email** `string`
      - **id** `string`
      - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
      - **lastUpdatedDate** `string`
      - **tags** `string[]`
        - `array` de:
      - **ips** `string[]`
        - `array` de:
      - **phoneNumbers** `string[]`
        - `array` de:
      - **firstName** `string`
      - **lastName** `string`
      - **provider** `Provider`
        - **id** `string` — ID of lead in external platform.
        - **integration** `object`
          - **name** `string`
          - **type** `string`
          - **id** `string` — Account ID of the integration.
      - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
      - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
      - **adOptimizationConsent** `AdOptimizationConsent` · valores: `GRANTED`, `DENIED`, `UNSPECIFIED`
      - **currentStage** `LeadStage` — Present only when the lead has a stage applied.
        - **name** `string` — Name of the stage.
        - **date** `string` — Date the stage was applied (ISO-8601 with timezone offset). Omitted when unavailable.
    - **sales** `Sale[]`
      - `array` de:
        - **id** `string`
        - **orderId** `string`
        - **creationDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
        - **refundDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601. Present only when the sale was refunded.
        - **qualified** `boolean`
        - **score** `number`
        - **recurring** `boolean`
        - **quantity** `number`
        - **lead** `Lead`
          - **email** `string`
          - **id** `string`
          - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
          - **lastUpdatedDate** `string`
          - **tags** `string[]`
            - `array` de:
          - **ips** `string[]`
            - `array` de:
          - **phoneNumbers** `string[]`
            - `array` de:
          - **firstName** `string`
          - **lastName** `string`
          - **provider** `Provider`
            - **id** `string` — ID of lead in external platform.
            - **integration** `object`
              - **name** `string`
              - **type** `string`
              - **id** `string` — Account ID of the integration.
          - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
            - **sourceLinkId** `string`
            - **name** `string`
            - **tag** `string`
            - **disregarded** `boolean`
            - **organic** `boolean`
            - **clickDate** `string`
            - **clickId** `string`
            - **adSource** `AdSource`
              - **adSourceId** `string`
              - **adAccountId** `string`
              - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
            - **sourceLinkAd** `SourceLinkAd`
              - **name** `string`
              - **adSourceId** `string`
            - **trafficSource** `TrafficSource`
              - **id** `string`
              - **name** `string`
            - **goal** `Goal`
              - **id** `string`
              - **name** `string`
            - **category** `Category`
              - **id** `string`
              - **name** `string`
            - **gclId** `string` — Only for Google.
            - **gbraId** `string` — Only for Google.
            - **wbraId** `string` — Only for Google.
          - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
            - **sourceLinkId** `string`
            - **name** `string`
            - **tag** `string`
            - **disregarded** `boolean`
            - **organic** `boolean`
            - **clickDate** `string`
            - **clickId** `string`
            - **adSource** `AdSource`
              - **adSourceId** `string`
              - **adAccountId** `string`
              - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
            - **sourceLinkAd** `SourceLinkAd`
              - **name** `string`
              - **adSourceId** `string`
            - **trafficSource** `TrafficSource`
              - **id** `string`
              - **name** `string`
            - **goal** `Goal`
              - **id** `string`
              - **name** `string`
            - **category** `Category`
              - **id** `string`
              - **name** `string`
            - **gclId** `string` — Only for Google.
            - **gbraId** `string` — Only for Google.
            - **wbraId** `string` — Only for Google.
          - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
          - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
        - **firstSource** `Attribution`
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - **adSourceId** `string`
            - **adAccountId** `string`
            - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
          - **sourceLinkAd** `SourceLinkAd`
            - **name** `string`
            - **adSourceId** `string`
          - **trafficSource** `TrafficSource`
            - **id** `string`
            - **name** `string`
          - **goal** `Goal`
            - **id** `string`
            - **name** `string`
          - **category** `Category`
            - **id** `string`
            - **name** `string`
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
        - **lastSource** `Attribution`
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - **adSourceId** `string`
            - **adAccountId** `string`
            - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
          - **sourceLinkAd** `SourceLinkAd`
            - **name** `string`
            - **adSourceId** `string`
          - **trafficSource** `TrafficSource`
            - **id** `string`
            - **name** `string`
          - **goal** `Goal`
            - **id** `string`
            - **name** `string`
          - **category** `Category`
            - **id** `string`
            - **name** `string`
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
        - **price** `Price`
          - **currency** `string`
          - **price** `number`
          - **discount** `number`
          - **hardCost** `number`
          - **refunded** `number`
        - **product** `SaleProduct` — Product information as it appears attached to a sale or call.
          - **id** `string`
          - **name** `string`
          - **tag** `string`
          - **sku** `string`
          - **category** `Category`
            - **id** `string`
            - **name** `string`
          - **provider** `Provider`
            - **id** `string` — ID of lead in external platform.
            - **integration** `object`
              - **name** `string`
              - **type** `string`
              - **id** `string` — Account ID of the integration.
        - **provider** `Provider`
          - **id** `string` — ID of lead in external platform.
          - **integration** `object`
            - **name** `string`
            - **type** `string`
            - **id** `string` — Account ID of the integration.
    - **calls** `Call[]`
      - `array` de:
        - **id** `string`
        - **tag** `string`
        - **qualified** `boolean`
        - **name** `string`
        - **externalId** `string`
        - **score** `number`
        - **creationDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
        - **state** `CallState` · valores: `QUALIFIED`, `UNQUALIFIED`, `CANCELLED`, `NO_SHOW`
        - **qualification** `object`
          - **name** `string`
          - **oldName** `string`
        - **lead** `Lead`
          - **email** `string`
          - **id** `string`
          - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
          - **lastUpdatedDate** `string`
          - **tags** `string[]`
            - `array` de:
          - **ips** `string[]`
            - `array` de:
          - **phoneNumbers** `string[]`
            - `array` de:
          - **firstName** `string`
          - **lastName** `string`
          - **provider** `Provider`
            - **id** `string` — ID of lead in external platform.
            - **integration** `object`
              - **name** `string`
              - **type** `string`
              - **id** `string` — Account ID of the integration.
          - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
            - **sourceLinkId** `string`
            - **name** `string`
            - **tag** `string`
            - **disregarded** `boolean`
            - **organic** `boolean`
            - **clickDate** `string`
            - **clickId** `string`
            - **adSource** `AdSource`
              - **adSourceId** `string`
              - **adAccountId** `string`
              - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
            - **sourceLinkAd** `SourceLinkAd`
              - **name** `string`
              - **adSourceId** `string`
            - **trafficSource** `TrafficSource`
              - **id** `string`
              - **name** `string`
            - **goal** `Goal`
              - **id** `string`
              - **name** `string`
            - **category** `Category`
              - **id** `string`
              - **name** `string`
            - **gclId** `string` — Only for Google.
            - **gbraId** `string` — Only for Google.
            - **wbraId** `string` — Only for Google.
          - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
            - **sourceLinkId** `string`
            - **name** `string`
            - **tag** `string`
            - **disregarded** `boolean`
            - **organic** `boolean`
            - **clickDate** `string`
            - **clickId** `string`
            - **adSource** `AdSource`
              - **adSourceId** `string`
              - **adAccountId** `string`
              - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
            - **sourceLinkAd** `SourceLinkAd`
              - **name** `string`
              - **adSourceId** `string`
            - **trafficSource** `TrafficSource`
              - **id** `string`
              - **name** `string`
            - **goal** `Goal`
              - **id** `string`
              - **name** `string`
            - **category** `Category`
              - **id** `string`
              - **name** `string`
            - **gclId** `string` — Only for Google.
            - **gbraId** `string` — Only for Google.
            - **wbraId** `string` — Only for Google.
          - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
          - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
        - **firstSource** `Attribution`
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - **adSourceId** `string`
            - **adAccountId** `string`
            - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
          - **sourceLinkAd** `SourceLinkAd`
            - **name** `string`
            - **adSourceId** `string`
          - **trafficSource** `TrafficSource`
            - **id** `string`
            - **name** `string`
          - **goal** `Goal`
            - **id** `string`
            - **name** `string`
          - **category** `Category`
            - **id** `string`
            - **name** `string`
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
        - **lastSource** `Attribution`
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - **adSourceId** `string`
            - **adAccountId** `string`
            - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
          - **sourceLinkAd** `SourceLinkAd`
            - **name** `string`
            - **adSourceId** `string`
          - **trafficSource** `TrafficSource`
            - **id** `string`
            - **name** `string`
          - **goal** `Goal`
            - **id** `string`
            - **name** `string`
          - **category** `Category`
            - **id** `string`
            - **name** `string`
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
    - **carts** `object[]`
      - `array` de:
        - **id** `string`
        - **orderId** `string` — Only present if cart was purchased.
        - **creationDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601, unlike the `creationDate` of `/carts`.
        - **events** `integer`
        - **provider** `Provider`
          - **id** `string` — ID of lead in external platform.
          - **integration** `object`
            - **name** `string`
            - **type** `string`
            - **id** `string` — Account ID of the integration.
        - **products** `SaleProduct[]`
          - `array` de:
            - **id** `string`
            - **name** `string`
            - **tag** `string`
            - **sku** `string`
            - **category** `Category`
              - **id** `string`
              - **name** `string`
            - **provider** `Provider`
              - **id** `string` — ID of lead in external platform.
              - **integration** `object`
                - _(anidamiento truncado)_
        - **firstSource** `Attribution`
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - **adSourceId** `string`
            - **adAccountId** `string`
            - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
          - **sourceLinkAd** `SourceLinkAd`
            - **name** `string`
            - **adSourceId** `string`
          - **trafficSource** `TrafficSource`
            - **id** `string`
            - **name** `string`
          - **goal** `Goal`
            - **id** `string`
            - **name** `string`
          - **category** `Category`
            - **id** `string`
            - **name** `string`
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
        - **lastSource** `Attribution`
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - **adSourceId** `string`
            - **adAccountId** `string`
            - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
          - **sourceLinkAd** `SourceLinkAd`
            - **name** `string`
            - **adSourceId** `string`
          - **trafficSource** `TrafficSource`
            - **id** `string`
            - **name** `string`
          - **goal** `Goal`
            - **id** `string`
            - **name** `string`
          - **category** `Category`
            - **id** `string`
            - **name** `string`
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
    - **subscriptions** `Subscription[]`
      - `array` de:
        - **id** `string`
        - **startDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
        - **endDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
        - **cancelAtDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
        - **trialStartDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
        - **trialEndDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
        - **price** `number`
        - **status** `SubscriptionStatus` · valores: `ACTIVE`, `TRIALING`, `CANCELED`, `PAST_DUE`, `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `UNPAID`, `COMPLETED`, `PAUSED`
        - **periodicity** `string`
        - **planId** `string`
        - **tag** `string`
        - **name** `string`
        - **lead** `Lead`
          - **email** `string`
          - **id** `string`
          - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
          - **lastUpdatedDate** `string`
          - **tags** `string[]`
            - `array` de:
          - **ips** `string[]`
            - `array` de:
          - **phoneNumbers** `string[]`
            - `array` de:
          - **firstName** `string`
          - **lastName** `string`
          - **provider** `Provider`
            - **id** `string` — ID of lead in external platform.
            - **integration** `object`
              - **name** `string`
              - **type** `string`
              - **id** `string` — Account ID of the integration.
          - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
            - **sourceLinkId** `string`
            - **name** `string`
            - **tag** `string`
            - **disregarded** `boolean`
            - **organic** `boolean`
            - **clickDate** `string`
            - **clickId** `string`
            - **adSource** `AdSource`
              - **adSourceId** `string`
              - **adAccountId** `string`
              - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
            - **sourceLinkAd** `SourceLinkAd`
              - **name** `string`
              - **adSourceId** `string`
            - **trafficSource** `TrafficSource`
              - **id** `string`
              - **name** `string`
            - **goal** `Goal`
              - **id** `string`
              - **name** `string`
            - **category** `Category`
              - **id** `string`
              - **name** `string`
            - **gclId** `string` — Only for Google.
            - **gbraId** `string` — Only for Google.
            - **wbraId** `string` — Only for Google.
          - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
            - **sourceLinkId** `string`
            - **name** `string`
            - **tag** `string`
            - **disregarded** `boolean`
            - **organic** `boolean`
            - **clickDate** `string`
            - **clickId** `string`
            - **adSource** `AdSource`
              - **adSourceId** `string`
              - **adAccountId** `string`
              - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
            - **sourceLinkAd** `SourceLinkAd`
              - **name** `string`
              - **adSourceId** `string`
            - **trafficSource** `TrafficSource`
              - **id** `string`
              - **name** `string`
            - **goal** `Goal`
              - **id** `string`
              - **name** `string`
            - **category** `Category`
              - **id** `string`
              - **name** `string`
            - **gclId** `string` — Only for Google.
            - **gbraId** `string` — Only for Google.
            - **wbraId** `string` — Only for Google.
          - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
          - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
        - **firstSource** `Attribution`
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - **adSourceId** `string`
            - **adAccountId** `string`
            - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
          - **sourceLinkAd** `SourceLinkAd`
            - **name** `string`
            - **adSourceId** `string`
          - **trafficSource** `TrafficSource`
            - **id** `string`
            - **name** `string`
          - **goal** `Goal`
            - **id** `string`
            - **name** `string`
          - **category** `Category`
            - **id** `string`
            - **name** `string`
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
        - **lastSource** `Attribution`
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - **adSourceId** `string`
            - **adAccountId** `string`
            - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
          - **sourceLinkAd** `SourceLinkAd`
            - **name** `string`
            - **adSourceId** `string`
          - **trafficSource** `TrafficSource`
            - **id** `string`
            - **name** `string`
          - **goal** `Goal`
            - **id** `string`
            - **name** `string`
          - **category** `Category`
            - **id** `string`
            - **name** `string`
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
        - **category** `Category` — Category of the first paid sale item attributed to the subscription. Set once when the first payment is attributed and not updated if the plan changes later. Null when no paid sale has been attributed yet, for example a subscription still in its trial period.
          - **id** `string`
          - **name** `string`
        - **provider** `Provider`
          - **id** `string` — ID of lead in external platform.
          - **integration** `object`
            - **name** `string`
            - **type** `string`
            - **id** `string` — Account ID of the integration.
    - **linkedLeads** `LeadWithStage[]`
      - `array` de:
        - **email** `string`
        - **id** `string`
        - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
        - **lastUpdatedDate** `string`
        - **tags** `string[]`
          - `array` de:
            - _(anidamiento truncado)_
        - **ips** `string[]`
          - `array` de:
            - _(anidamiento truncado)_
        - **phoneNumbers** `string[]`
          - `array` de:
            - _(anidamiento truncado)_
        - **firstName** `string`
        - **lastName** `string`
        - **provider** `Provider`
          - **id** `string` — ID of lead in external platform.
          - **integration** `object`
            - _(anidamiento truncado)_
        - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - _(anidamiento truncado)_
          - **sourceLinkAd** `SourceLinkAd`
            - _(anidamiento truncado)_
          - **trafficSource** `TrafficSource`
            - _(anidamiento truncado)_
          - **goal** `Goal`
            - _(anidamiento truncado)_
          - **category** `Category`
            - _(anidamiento truncado)_
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
        - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
          - **sourceLinkId** `string`
          - **name** `string`
          - **tag** `string`
          - **disregarded** `boolean`
          - **organic** `boolean`
          - **clickDate** `string`
          - **clickId** `string`
          - **adSource** `AdSource`
            - _(anidamiento truncado)_
          - **sourceLinkAd** `SourceLinkAd`
            - _(anidamiento truncado)_
          - **trafficSource** `TrafficSource`
            - _(anidamiento truncado)_
          - **goal** `Goal`
            - _(anidamiento truncado)_
          - **category** `Category`
            - _(anidamiento truncado)_
          - **gclId** `string` — Only for Google.
          - **gbraId** `string` — Only for Google.
          - **wbraId** `string` — Only for Google.
        - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
        - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
        - **adOptimizationConsent** `AdOptimizationConsent` · valores: `GRANTED`, `DENIED`, `UNSPECIFIED`
        - **currentStage** `LeadStage` — Present only when the lead has a stage applied.
          - **name** `string` — Name of the stage.
          - **date** `string` — Date the stage was applied (ISO-8601 with timezone offset). Omitted when unavailable.
    - **journey** `JourneyEvent[]` — Chronological journey events for the lead. Only present when `includeEvents=true`.
      - `array` de:
        - **type** `string` — Event type. Examples include `sale`, `call`, `subscription-started`, `subscription-ended`, `email`, `email-open`, and tracking events such as clicks and page views.
        - **id** `string` — Identifier of the underlying record. Present only for events backed by an external entity (`sale`, `call`, `subscription-started`, `subscription-ended`, `email`, `email-open`).
        - **date** `string` — ISO 8601 timestamp (in the account timezone) when the event occurred.
        - **extra** `string` — Additional context for the event.
        - **tag** `string`
        - **name** `string`
        - **keyword** `string`
        - **integrationProvider** `string` — Source integration/provider associated with the event, when applicable.
        - **currencySymbol** `string` — Currency symbol for monetary events (e.g. sales).
        - **emailSource** `boolean` — Whether the event originated from an email source.
        - **subNames** `string[]` — Sub-element names, e.g. the individual products of a grouped cart event.
          - `array` de:
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/orders`

**Create Order**

> [!NOTE] > **Required role** — Create Orders > > **Asynchronous** — effect is not immediate; changes typically appear within ~10 seconds. Create an order with all necessary information. Additionally, creates the lead if not already present.

tags: `Orders`

### Request body — `application/json` (requerido)

- **email** `string` — Email associated with the lead. Required if no phone number is provided.
- **parentEmail** `string` — Email of the origin lead. If present, the sale will be attributed to the origin lead.
- **firstName** `string`
- **lastName** `string`
- **leadIps** `string[]`
  - `array` de:
- **stage** `string`
- **phoneNumbers** `string | string[]` — Required if no email is provided.
  - _uno de:_
    - **string**
    - **string[]**
      - `array` de:
- **orderId** `string` — Identifier by which sales will be grouped. Only letters, numbers, underscores, hyphens, periods, and colons. No spaces.
- **externalSubscriptionId** `string`
- **cartId** `string`
- **date** `string` — ISO 8601 date when the transaction was processed. Defaults to current date.
- **shippingCost** `number` — Shipping cost distributed across items. Default is 0.
- **taxes** `number` — Order taxes distributed across items. Default is 0.
- **orderDiscount** `number` — Discount applied to the complete order, distributed evenly across all line items.
- **priceFormat** `string` · valores: `DECIMAL`, `INTEGER` · default: `DECIMAL`
- **currency** `string` — Currency code (e.g. EUR). Defaults to Hyros account setup.
- **items** `Item[]` _requerido_
  - `array` de:
    - **name** `string` _requerido_ — Name of the product.
    - **price** `number` _requerido_ — Product price per unit (costOfGoods included).
    - **externalId** `string` — Unique identifier from the external integration.
    - **quantity** `number` — Number of copies purchased. Defaults to 1. · default: `1`
    - **sku** `string` — Unique product reference code.
    - **costOfGoods** `number` — Cost per unit of manufacture. Must be included in the price. Defaults to 0. · default: `0`
    - **taxes** `number` — Taxes applied to the item per unit. Defaults to 0. · default: `0`
    - **itemDiscount** `number` — Discount applied to this specific line item.
    - **packages** `string[]` — Product packages this item belongs to (used for recurring sales attribution).
      - `array` de:
    - **isRebill** `boolean` — If true, the sale is marked as recurring even if it's the first one.
    - **tag** `string` — Tag to create for the sale item.
    - **categoryName** `string` — Links the sale to a product category.

```json
{
  "email": "john@doe.com",
  "parentEmail": "jane@doe.com",
  "firstName": "John",
  "lastName": "Doe",
  "leadIps": [
    "172.8.105.28"
  ],
  "stage": "Customer",
  "phoneNumbers": [
    "1105385366"
  ],
  "orderId": "56354354588",
  "cartId": "d49b708b3df50505869ca54f026e7c97a4959b587605f14f91c7e289de9f80bd",
  "date": "2021-04-16T20:35:00",
  "priceFormat": "DECIMAL",
  "currency": "USD",
  "taxes": 98.6,
  "shippingCost": 10,
  "orderDiscount": 3.5,
  "items": [
    {
      "name": "T-Shirt - Blue",
      "price": 15.5,
      "costOfGoods": 2.25,
      "externalId": "18294892740",
      "quantity": 2,
      "sku": "DEPOR-XYZ-BLN-41",
      "taxes": 2.5,
      "itemDiscount": 2.5,
      "packages": [
        "Package 1",
        "Package 2"
      ],
      "isRebill": false,
      "tag": "$premiun-t-shirt-blue",
      "categoryName": "premium store"
    }
  ]
}
```

### Respuestas

**`200`** — Order created successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `DELETE /api/v1.0/orders/{id}`

**Refund Order**

> [!NOTE] > **Required role** — Delete Orders > > **Asynchronous** — effect is not immediate; changes typically appear within ~5 minutes. Refund an order by order id and update the income of the lead.

tags: `Orders`

### Parámetros

- **id** (`path`) `string` _requerido_ — Order id to be refunded.
- **refundedAmount** (`query`) `string` — Amount to be refunded.

### Respuestas

**`200`** — Order refunded successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `PUT /api/v1.0/orders/{id}`

**Update Order**

> [!NOTE] > **Required role** — Update Orders > > **Asynchronous** — effect is not immediate; changes typically appear within ~5 minutes. Update an order by replacing its items list and optionally updating order-level fields. The existing sales of the order are soft-deleted and recreated according to the provided items.

tags: `Orders`

### Parámetros

- **id** (`path`) `string` _requerido_ — Identifier of the order to update. By default this is the order id used during creation. When `integrationType` is provided in the body, this value is matched against the `externalId` of any item belonging to the order; the whole order is then resolved through that item.

### Request body — `application/json` (requerido)

- **integrationType** `string` — External integration the order belongs to (e.g. STRIPE, SHOPIFY, KONNEKTIVE, API). When present, the path id is matched against an item externalId for that integration.
- **stage** `string` — Stage to apply to the customer's lead.
- **externalSubscriptionId** `string`
- **cartId** `string`
- **shippingCost** `number` — Shipping cost distributed across items. Default is 0.
- **taxes** `number` — Order taxes distributed across items. Default is 0.
- **orderDiscount** `number` — Discount applied to the complete order, distributed evenly across all line items.
- **priceFormat** `string` · valores: `DECIMAL`, `INTEGER` · default: `DECIMAL`
- **currency** `string` — Currency code (e.g. EUR). Defaults to Hyros account setup.
- **items** `Item[]` _requerido_ — New items list. The existing items of the order will be replaced by this list.
  - `array` de:
    - **name** `string` _requerido_ — Name of the product.
    - **price** `number` _requerido_ — Product price per unit (costOfGoods included).
    - **externalId** `string` — Unique identifier from the external integration.
    - **quantity** `number` — Number of copies purchased. Defaults to 1. · default: `1`
    - **sku** `string` — Unique product reference code.
    - **costOfGoods** `number` — Cost per unit of manufacture. Must be included in the price. Defaults to 0. · default: `0`
    - **taxes** `number` — Taxes applied to the item per unit. Defaults to 0. · default: `0`
    - **itemDiscount** `number` — Discount applied to this specific line item.
    - **packages** `string[]` — Product packages this item belongs to (used for recurring sales attribution).
      - `array` de:
    - **isRebill** `boolean` — If true, the sale is marked as recurring even if it's the first one.
    - **tag** `string` — Tag to create for the sale item.
    - **categoryName** `string` — Links the sale to a product category.

```json
{
  "stage": "Repeat Customer",
  "cartId": "d49b708b3df50505869ca54f026e7c97a4959b587605f14f91c7e289de9f80bd",
  "priceFormat": "DECIMAL",
  "currency": "USD",
  "taxes": 98.6,
  "shippingCost": 10,
  "orderDiscount": 3.5,
  "items": [
    {
      "name": "T-Shirt - Blue",
      "price": 15.5,
      "costOfGoods": 2.25,
      "externalId": "18294892740",
      "quantity": 2,
      "sku": "DEPOR-XYZ-BLN-41",
      "taxes": 2.5,
      "itemDiscount": 2.5,
      "isRebill": false,
      "tag": "$premiun-t-shirt-blue",
      "categoryName": "premium store"
    }
  ]
}
```

### Respuestas

**`200`** — Order updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/products`

**Retrieve Products**

> [!NOTE] > **Required role** — Get Products Search and retrieve products by name, tag, category and recurrence. Results are paginated.

tags: `Products`

### Parámetros

- **name** (`query`) `string` — Filter products whose name equals this value (exact match).
- **tag** (`query`) `string` — Filter products whose tag equals this value (exact match). The sale prefix "$" is added automatically when omitted.
- **category** (`query`) `string` — Filter products by the name of their category.
- **isRecurringSale** (`query`) `string` — Filter by recurring status. · valores: `RECURRING`, `NON_RECURRING`, `ALL` · default: `ALL`
- **pageSize** (`query`) `integer` — Maximum number of products per page. Range 1-250. · default: `50`
- **pageId** (`query`) `string` — ID of the next page. Returned in `nextPageId` of each response.

### Respuestas

**`200`** — Successful response.

- **result** `Product[]`
  - `array` de:
    - **id** `string` — Product id (its tracking pixel).
    - **name** `string`
    - **tag** `string`
    - **sku** `string`
    - **price** `number`
    - **customCost** `number` — Cost of goods of the product, used in profit and ROAS reporting.
    - **recurring** `boolean`
    - **callProduct** `boolean`
    - **category** `string` — Category name.
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/products`

**Create Product**

> [!NOTE] > **Required role** — Create Products > > **Asynchronous** — effect is not immediate; changes typically appear within ~10 seconds. Create a product with name, price and category. The tag is created from the product's name.

tags: `Products`

### Request body — `application/json` (requerido)

- **name** `string` _requerido_ — Name of the product. Must have at least 3 characters.
- **price** `number` _requerido_ — Plain number only: up to 8 digits before the decimal point and up to 2 after (max 99999999.99). Currency symbols and separators are not accepted.
- **category** `string`
- **packages** `string[]` — Product packages (used for recurring sales attribution).
  - `array` de:

```json
{
  "name": "Product 1",
  "price": 5.66,
  "category": "Category 1",
  "packages": [
    "Package 1",
    "Package 2"
  ]
}
```

### Respuestas

**`200`** — Product created successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `DELETE /api/v1.0/products/{id}`

**Delete Product**

> [!NOTE] > **Required role** — Delete Products Delete a product by its id.

tags: `Products`

### Parámetros

- **id** (`path`) `string` _requerido_ — Product id (its tracking pixel, as returned by the products listing) to be deleted.

### Respuestas

**`200`** — Product deleted successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `PUT /api/v1.0/products/{id}`

**Update Product**

> [!NOTE] > **Required role** — Update Products Update a product's fields. Only the fields included in the request are modified; any field left out is kept unchanged.

tags: `Products`

### Parámetros

- **id** (`path`) `string` _requerido_ — Product id (its tracking pixel, as returned by the products listing).

### Request body — `application/json` (requerido)

- **name** `string` — Name of the product. Must have at least 3 characters.
- **price** `number` — Plain number only: up to 8 digits before the decimal point and up to 2 after (max 99999999.99). Currency symbols and separators are not accepted.
- **customCost** `number` — Cost of goods of the product, used in profit and ROAS reporting.
- **tag** `string`
- **sku** `string`
- **category** `string`
- **isRecurringSale** `boolean` — Whether the product is a recurring sale. A product cannot be both a recurring sale and a call product.
- **callProduct** `boolean` — Whether the product is a call product. A product cannot be both a recurring sale and a call product.
- **packages** `string[]` — Product packages (used for recurring sales attribution). Omit to keep the current packages unchanged; send an empty array to remove the product from all packages.
  - `array` de:
- **updateHistoricalSales** `boolean` — When true, a cost change is propagated to the product's existing sales, updating their profit and ROAS. · default: `False`

```json
{
  "price": 7.99,
  "customCost": 3.0,
  "updateHistoricalSales": true
}
```

### Respuestas

**`200`** — Product updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/sales`

**Retrieve Sales**

> [!NOTE] > **Required role** — Get Sales Search and retrieve sales by date, email, lead id, product tag, id, recurring status, and refund status. Filtering by `orderId` is **not** supported — the supported filters are the query parameters listed below; `orderId` is present only in the response body. Response `creationDate`/`refundDate` are returned in `EEE MMM dd HH:mm:ss zzz yyyy` format, not ISO 8601.

tags: `Sales`

### Parámetros

- **ids** (`query`) `string` — Array of sales ids. At most 50 can be provided.
- **emails** (`query`) `string` — Array of emails or prefixes. At most 50 can be provided.
- **leadIds** (`query`) `string` — Array of leadIds. At most 50 can be provided.
- **productTags** (`query`) `string` — Array of product tags. At most 20 can be provided.
- **isRecurringSale** (`query`) `string` — Filter by recurring status. · valores: `RECURRING`, `NON_RECURRING`, `ALL` · default: `ALL`
- **saleRefundedState** (`query`) `string` — Filter by refund status. · valores: `REFUNDED`, `NON_REFUNDED`, `ALL` · default: `ALL`
- **fromDate** (`query`) `string` — ISO 8601 date. Only sales after this date will be retrieved.
- **toDate** (`query`) `string` — ISO 8601 date. Only sales before this date will be retrieved.
- **pageSize** (`query`) `integer` — Maximum number of sales per page. Range 1-250.
- **pageId** (`query`) `string` — ID of the next page, taken from the `nextPageId` of a previous response. Omit it to fetch the first page. An invalid or expired pagination cursor is rejected with `400 Bad Request`.

### Respuestas

**`200`** — Successful response.

- **result** `Sale[]`
  - `array` de:
    - **id** `string`
    - **orderId** `string`
    - **creationDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **refundDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601. Present only when the sale was refunded.
    - **qualified** `boolean`
    - **score** `number`
    - **recurring** `boolean`
    - **quantity** `number`
    - **lead** `Lead`
      - **email** `string`
      - **id** `string`
      - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
      - **lastUpdatedDate** `string`
      - **tags** `string[]`
        - `array` de:
      - **ips** `string[]`
        - `array` de:
      - **phoneNumbers** `string[]`
        - `array` de:
      - **firstName** `string`
      - **lastName** `string`
      - **provider** `Provider`
        - **id** `string` — ID of lead in external platform.
        - **integration** `object`
          - **name** `string`
          - **type** `string`
          - **id** `string` — Account ID of the integration.
      - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
      - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
    - **firstSource** `Attribution`
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
    - **lastSource** `Attribution`
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
    - **price** `Price`
      - **currency** `string`
      - **price** `number`
      - **discount** `number`
      - **hardCost** `number`
      - **refunded** `number`
    - **product** `SaleProduct` — Product information as it appears attached to a sale or call.
      - **id** `string`
      - **name** `string`
      - **tag** `string`
      - **sku** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **provider** `Provider`
        - **id** `string` — ID of lead in external platform.
        - **integration** `object`
          - **name** `string`
          - **type** `string`
          - **id** `string` — Account ID of the integration.
    - **provider** `Provider`
      - **id** `string` — ID of lead in external platform.
      - **integration** `object`
        - **name** `string`
        - **type** `string`
        - **id** `string` — Account ID of the integration.
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `PUT /api/v1.0/sales`

**Update Sales**

> [!NOTE] > **Required role** — Update Sales > > **Asynchronous** — effect is not immediate; changes typically appear within ~5 minutes. Update sales by their ids.

tags: `Sales`

### Parámetros

- **ids** (`query`) `string` _requerido_ — Array of sales ids. At most 50 can be provided.
- **isRecurringSale** (`query`) `boolean` — Indicates if the sales will be recurring or not.
- **isRefunded** (`query`) `boolean` — Indicates if the sales will be refunded or not.
- **refundedDate** (`query`) `string` — ISO 8601 date. Optional even when `isRefunded` is true; if omitted, the refunded date is set to the present date.
- **refundedAmount** (`query`) `string` — Amount to be refunded.

### Respuestas

**`200`** — Sales updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `DELETE /api/v1.0/sales/{id}`

**Delete Sale**

> [!NOTE] > **Required role** — Delete Sales > > **Asynchronous** — effect is not immediate; changes typically appear within ~5 minutes. Delete a sale by its id.

tags: `Sales`

### Parámetros

- **id** (`path`) `string` _requerido_ — Sale id to be deleted.

### Respuestas

**`200`** — Sale deleted successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/sources`

**List all Sources**

> [!NOTE] > **Required role** — Get Sources Search and retrieve sources by organic/disregarded status and by adSpendType/adSpendId.

tags: `Sources`

### Parámetros

- **adSourceIds** (`query`) `string` — Array of ad source ids to retrieve.
- **includeOrganic** (`query`) `boolean`
- **includeDisregarded** (`query`) `boolean`
- **integrationType** (`query`) `AdspendType`
- **pageSize** (`query`) `integer` — Between 1 and 250.
- **pageId** (`query`) `string`

### Respuestas

**`200`** — Successful response.

- **result** `Source[]`
  - `array` de:
    - **name** `string`
    - **tag** `string`
    - **disregarded** `boolean`
    - **organic** `boolean`
    - **adSource** `AdSource`
      - **adSourceId** `string`
      - **adAccountId** `string`
      - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
    - **trafficSource** `TrafficSource`
      - **id** `string`
      - **name** `string`
    - **goal** `Goal`
      - **id** `string`
      - **name** `string`
    - **category** `Category`
      - **id** `string`
      - **name** `string`
    - **creationDate** `integer` — Returned as epoch milliseconds (a number) instead of ISO 8601.
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/sources`

**Create Source**

> [!NOTE] > **Required role** — Create Sources > > **Asynchronous** — effect is not immediate; changes typically appear within ~10 seconds. Create a source. Can be organic, non-organic, or from ad platforms (Google/Facebook/etc).

tags: `Sources`

### Request body — `application/json` (requerido)

- **name** `string` _requerido_
- **category** `string`
- **goal** `string`
- **trafficSource** `string`
- **isDisregard** `boolean`
- **isOrganic** `boolean`
- **integrationType** `string` — Subset of `AdspendType` accepted when creating a source. · valores: `GOOGLE`, `FACEBOOK`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`
- **adSourceId** `string` — Id of the ad. Required if `integrationType` is present. - Facebook: adset id - Google: campaign id - TikTok: ad group id - Snapchat: ad squad id - LinkedIn: campaign id
- **accountId** `string` — Id of the ad account. Required if `integrationType` is present.
- **adspendSubType** `AdspendSubType` — Required when `integrationType` is GOOGLE. · valores: `DISPLAY`, `VIDEO`
- **campaignId** `string` — Required when `integrationType` is FACEBOOK.

```json
{
  "name": "Organic ad 1",
  "category": "Instagram posts",
  "goal": "opt ins",
  "trafficSource": "organic",
  "isOrganic": true
}
```

### Respuestas

**`200`** — Source created successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `DELETE /api/v1.0/sources/{tag}`

**Delete Source**

> [!NOTE] > **Required role** — Delete Sources Delete an existing source, identified by its `tag`. The source is soft deleted and no longer appears in attribution.

tags: `Sources`

### Parámetros

- **tag** (`path`) `string` _requerido_ — The `tag` of the source to delete, as returned by `GET /api/v1.0/sources`.

### Respuestas

**`200`** — Source deleted successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `PUT /api/v1.0/sources/{tag}`

**Update Source**

> [!NOTE] > **Required role** — Update Sources > > **Asynchronous** — effect is not immediate (see note below). Edit an existing source, identified by its `tag`. Every field is optional: only the fields present in the request are changed, the rest are left untouched. Editing a source re-attributes its associated sales in the background. Note: the update is applied asynchronously. A `200` response means the request was accepted; the changes (and the re-attribution of associated sales) may take a few minutes to be reflected in `GET /api/v1.0/sources` and in reports.

tags: `Sources`

### Parámetros

- **tag** (`path`) `string` _requerido_ — The `tag` of the source to update, as returned by `GET /api/v1.0/sources`.

### Request body — `application/json` (requerido)

- **name** `string` — New name of the source.
- **tag** `string` — New tag to be assigned to the source (a new tag, or an existing one not used by another source). Must be a source tag: include the `@` prefix, e.g. `@my-source` (a value with no prefix is automatically prefixed with `@`). A tag with a non-source prefix (`$`, `!`, `#`) is rejected with `Invalid tag`.
- **category** `string` — Name of the source category. Created if it does not exist.
- **goal** `string` — Name of the goal. Created if it does not exist.
- **trafficSource** `string` — Name of the traffic source. Created if it does not exist.
- **isDisregard** `boolean` — Whether the source is disregarded when attributing a sale.
- **isOrganic** `boolean` — Whether the source is marked as an organic source.

```json
{
  "name": "Organic ad 1 (renamed)",
  "tag": "@organic-ad-1",
  "category": "Instagram posts",
  "isDisregard": true
}
```

### Respuestas

**`200`** — Source updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/stages`

**Retrieve Lead Stages**

> [!NOTE] > **Required role** — Get Leads Retrieves all lead stages for the account, along with the count of leads in each stage.

tags: `Stages`

### Parámetros

- **name** (`query`) `string` — Name to search stages by.
- **pageSize** (`query`) `integer` — Range 1-250.
- **pageId** (`query`) `string`

### Respuestas

**`200`** — Successful response.

- **result** `object[]`
  - `array` de:
    - **name** `string`
    - **amount** `integer`
- **nextPageId** `string`
- **request_id** `string`

```json
{
  "result": [
    {
      "name": "SQL",
      "amount": 1
    },
    {
      "name": "MQL",
      "amount": 5
    }
  ],
  "nextPageId": "1073e129b360b78db3508bea584d1f295c7851c3d9b290308ac57528b6e38a21",
  "request_id": "5696f9a3524e42318f3cdf40176e70e3"
}
```

**`401`** — Unauthorized.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/subscriptions`

**Retrieve Subscriptions**

> [!NOTE] > **Required role** — Get Subscriptions Search and retrieve subscriptions by start/end date, email, lead id, product tag, id, and states.

tags: `Subscriptions`

### Parámetros

- **ids** (`query`) `string` — Array of subscription ids. At most 50.
- **emails** (`query`) `string` — Array of emails or prefixes. At most 50.
- **leadIds** (`query`) `string` — Array of leadIds. At most 50.
- **productTags** (`query`) `string` — Array of product tags. At most 20.
- **subscriptionStates** (`query`) `string` — Filter by subscription status. Defaults to all states.
- **fromDate** (`query`) `string`
- **toDate** (`query`) `string`
- **pageSize** (`query`) `integer` — Range 1-250.
- **pageId** (`query`) `string` — ID of the next page, taken from the `nextPageId` of a previous response. Omit it to fetch the first page. An invalid or expired pagination cursor is rejected with `400 Bad Request`.

### Respuestas

**`200`** — Successful response.

- **result** `Subscription[]`
  - `array` de:
    - **id** `string`
    - **startDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **endDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **cancelAtDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **trialStartDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **trialEndDate** `string` — Returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format instead of ISO 8601.
    - **price** `number`
    - **status** `SubscriptionStatus` · valores: `ACTIVE`, `TRIALING`, `CANCELED`, `PAST_DUE`, `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `UNPAID`, `COMPLETED`, `PAUSED`
    - **periodicity** `string`
    - **planId** `string`
    - **tag** `string`
    - **name** `string`
    - **lead** `Lead`
      - **email** `string`
      - **id** `string`
      - **creationDate** `string` — ISO 8601 date. When the lead is embedded in `/sales`, `/calls`, or `/subscriptions`, it is returned in the legacy `EEE MMM dd HH:mm:ss zzz yyyy` format for backward compatibility.
      - **lastUpdatedDate** `string`
      - **tags** `string[]`
        - `array` de:
      - **ips** `string[]`
        - `array` de:
      - **phoneNumbers** `string[]`
        - `array` de:
      - **firstName** `string`
      - **lastName** `string`
      - **provider** `Provider`
        - **id** `string` — ID of lead in external platform.
        - **integration** `object`
          - **name** `string`
          - **type** `string`
          - **id** `string` — Account ID of the integration.
      - **firstSource** `Attribution` — First attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **lastSource** `Attribution` — Last attributed source of the lead. Omitted when unknown.
        - **sourceLinkId** `string`
        - **name** `string`
        - **tag** `string`
        - **disregarded** `boolean`
        - **organic** `boolean`
        - **clickDate** `string`
        - **clickId** `string`
        - **adSource** `AdSource`
          - **adSourceId** `string`
          - **adAccountId** `string`
          - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
        - **sourceLinkAd** `SourceLinkAd`
          - **name** `string`
          - **adSourceId** `string`
        - **trafficSource** `TrafficSource`
          - **id** `string`
          - **name** `string`
        - **goal** `Goal`
          - **id** `string`
          - **name** `string`
        - **category** `Category`
          - **id** `string`
          - **name** `string`
        - **gclId** `string` — Only for Google.
        - **gbraId** `string` — Only for Google.
        - **wbraId** `string` — Only for Google.
      - **originLead** `Lead` — The origin lead this lead was merged into, when applicable. Omitted otherwise.
      - **isOriginLead** `boolean` — Present on the leads journey (`GET /leads/journey`) and on the nested `originLead`; indicates the lead is an origin lead.
    - **firstSource** `Attribution`
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
    - **lastSource** `Attribution`
      - **sourceLinkId** `string`
      - **name** `string`
      - **tag** `string`
      - **disregarded** `boolean`
      - **organic** `boolean`
      - **clickDate** `string`
      - **clickId** `string`
      - **adSource** `AdSource`
        - **adSourceId** `string`
        - **adAccountId** `string`
        - **platform** `AdspendType` · valores: `FACEBOOK`, `GOOGLE`, `GOOGLE_V2`, `TIKTOK`, `SNAPCHAT`, `LINKEDIN`, `TWITTER`, `PINTEREST`, `BING`, `REDDIT`, `APPLOVIN`, `WHOP_ADS`
      - **sourceLinkAd** `SourceLinkAd`
        - **name** `string`
        - **adSourceId** `string`
      - **trafficSource** `TrafficSource`
        - **id** `string`
        - **name** `string`
      - **goal** `Goal`
        - **id** `string`
        - **name** `string`
      - **category** `Category`
        - **id** `string`
        - **name** `string`
      - **gclId** `string` — Only for Google.
      - **gbraId** `string` — Only for Google.
      - **wbraId** `string` — Only for Google.
    - **category** `Category` — Category of the first paid sale item attributed to the subscription. Set once when the first payment is attributed and not updated if the plan changes later. Null when no paid sale has been attributed yet, for example a subscription still in its trial period.
      - **id** `string`
      - **name** `string`
    - **provider** `Provider`
      - **id** `string` — ID of lead in external platform.
      - **integration** `object`
        - **name** `string`
        - **type** `string`
        - **id** `string` — Account ID of the integration.
- **nextPageId** `string`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/subscriptions`

**Create Subscription**

> [!NOTE] > **Required role** — Create Subscriptions > > **Asynchronous** — effect is not immediate; changes typically appear within ~10 seconds. Create a subscription. Additionally, creates the lead if not already present.

tags: `Subscriptions`

### Request body — `application/json` (requerido)

- **email** `string` — Required if no phone number is provided.
- **parentEmail** `string`
- **firstName** `string`
- **lastName** `string`
- **leadIps** `string[]`
  - `array` de:
- **stage** `string`
- **phoneNumbers** `string | string[]` — Required if no email is provided.
  - _uno de:_
    - **string**
    - **string[]**
      - `array` de:
- **subscriptionId** `string`
- **name** `string`
- **status** `SubscriptionStatus` _requerido_ · valores: `ACTIVE`, `TRIALING`, `CANCELED`, `PAST_DUE`, `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `UNPAID`, `COMPLETED`, `PAUSED`
- **startDate** `string` _requerido_
- **endDate** `string`
- **cancelAtDate** `string`
- **trialStartDate** `string`
- **trialEndDate** `string`
- **planId** `string`
- **price** `number` _requerido_
- **periodicity** `string` _requerido_ · valores: `DAY`, `WEEK`, `MONTH`, `QUARTER`, `YEAR`

```json
{
  "email": "john@doe.com",
  "parentEmail": "jane@doe.com",
  "firstName": "John",
  "lastName": "Doe",
  "leadIps": [
    "172.8.105.28"
  ],
  "stage": "Customer",
  "phoneNumbers": [
    "1105385366"
  ],
  "endDate": "2025-03-16T20:35:00",
  "subscriptionId": "18294892740",
  "startDate": "2025-01-16T20:35:00",
  "trialStartDate": "2025-02-16T20:35:00",
  "planId": "IOJNF0293IRD9023JF0D",
  "price": 8.9,
  "periodicity": "MONTH",
  "status": "ACTIVE",
  "name": "Monthly Subscription Active"
}
```

### Respuestas

**`200`** — Subscription created successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `PUT /api/v1.0/subscriptions`

**Update Subscription**

> [!NOTE] > **Required role** — Update Subscriptions > > **Asynchronous** — effect is not immediate; changes typically appear within ~5 minutes. Update a subscription.

tags: `Subscriptions`

### Request body — `application/json` (requerido)

- **ids** `string[]` _requerido_ — Array of subscription ids. At most 50.
  - `array` de:
- **name** `string`
- **status** `SubscriptionStatus` · valores: `ACTIVE`, `TRIALING`, `CANCELED`, `PAST_DUE`, `INCOMPLETE`, `INCOMPLETE_EXPIRED`, `UNPAID`, `COMPLETED`, `PAUSED`
- **startDate** `string`
- **endDate** `string`
- **cancelAtDate** `string`
- **trialStartDate** `string`
- **trialEndDate** `string`
- **price** `number`

```json
{
  "ids": [
    "subscriptionId"
  ],
  "status": "CANCELED",
  "name": "Monthly Subscription Active",
  "startDate": "2025-01-16T20:35:00",
  "endDate": "2025-03-16T20:35:00",
  "trialStartDate": "2025-02-16T20:35:00",
  "trialEndDate": "2025-03-16T20:35:00",
  "cancelAtDate": "2025-03-16T20:35:00"
}
```

### Respuestas

**`200`** — Subscription updated successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/tags`

> ⚠️ **Deprecado.**

**List all Tags**

> [!NOTE] > **Required role** — Get Tags Deprecated: to be replaced by GET /api/v1.0/tags/count. List all of your created tags.

tags: `Tags`

### Respuestas

**`200`** — Successful response.

- **request_id** `string`
- **result** `string[]`
  - `array` de:

```json
{
  "request_id": "43573923369e40bbafd46925a5c15ff5",
  "result": [
    "!tag1",
    "!tag2",
    "$sale1"
  ]
}
```

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/tags/count`

**List tags with lead counts**

> [!NOTE] > **Required role** — Get Tags List your created tags along with the count of leads that have each tag. A lead that has several of your tags is counted once for each of those tags.

tags: `Tags`

### Parámetros

- **name** (`query`) `string` — Exact tag name to filter by.
- **pageSize** (`query`) `integer` — Range 1-250.
- **pageId** (`query`) `string`

### Respuestas

**`200`** — Successful response.

- **result** `object[]`
  - `array` de:
    - **name** `string`
    - **amount** `integer`
- **nextPageId** `string`
- **request_id** `string`

```json
{
  "result": [
    {
      "name": "!tag1",
      "amount": 12
    },
    {
      "name": "!tag2",
      "amount": 0
    },
    {
      "name": "$sale1",
      "amount": 3
    }
  ],
  "nextPageId": "1073e129b360b78db3508bea584d1f295c7851c3d9b290308ac57528b6e38a21",
  "request_id": "43573923369e40bbafd46925a5c15ff5"
}
```

**`401`** — Unauthorized.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/tracking-script`

**Get Tracking Script**

> [!NOTE] > **Required role** — Get Lead Clicks Retrieves the tracking script for a given domain. If no domain is provided, returns the default tracking script. The script can be customized with optional parameters to enable SPA tracking, ignore previous URLs, embed on iframes, or hide tracking parameters.

tags: `Tracking Script`

### Parámetros

- **domain** (`query`) `string` — Domain for which to retrieve the tracking script.
- **spa** (`query`) `boolean` — Enables tracking of clicks and emails on URL change for Single Page Applications (SPA). Defaults to false. · default: `False`
- **ignorePrevUrl** (`query`) `boolean` — When true, ignores sources from the previous URL during attribution. Defaults to false. · default: `False`
- **embed** (`query`) `boolean` — When true, embeds the Universal script on iframes. Defaults to false. · default: `False`
- **deleteTrackingScriptParams** (`query`) `boolean` — When true, the Universal Script will automatically hide the tracking parameters in the URL after use. This setting is persisted as user metadata.

### Respuestas

**`200`** — Tracking script HTML.


```json
"<script>\n    var head = document.head;\n    var script = document.createElement('script');\n    script.type = 'text/javascript';\n    script.src = \"https://api.hyros.com/v1/lst/universal-script?ph=a48210e63e83136228b90e18c16461c07ba3c7bee05ba64615ecae4edcf9d130&tag=!clicked&ref_url=\" + encodeURIComponent(document.URL);\n    head.appendChild(script);\n</script>\n"
```

**`400`** — Invalid domain.


---

## `GET /api/v1.0/user-info`

**Retrieve User Information**

> [!NOTE] > **Required role** — Get User Information Retrieve user profile, connected accounts, and true tracking configuration.

tags: `User Info`

### Respuestas

**`200`** — Successful response.

- **result** `object`
  - **userProfile** `object`
    - **email** `string`
    - **firstName** `string`
    - **lastName** `string`
    - **phoneNumber** `integer`
    - **companyName** `string`
    - **profilePicture** `string`
    - **vat** `string`
    - **helpNotes** `boolean`
    - **notificationsEnabled** `string`
    - **timezone** `string`
    - **userAddress** `object`
      - **street** `string`
      - **city** `string`
      - **state** `string`
      - **zipCode** `string`
  - **allowedAccounts** `object[]`
    - `array` de:
      - **firstName** `string`
      - **lastName** `string`
      - **companyName** `string`
      - **email** `string`
      - **pictureUrl** `string`
      - **status** `string`
  - **accessibleAccounts** `object[]`
    - `array` de:
      - **accountId** `string` — Opaque, stable identifier of the account. Use it to identify that account on other operations.
      - **firstName** `string`
      - **lastName** `string`
      - **companyName** `string`
      - **email** `string`
      - **pictureUrl** `string`
      - **status** `string`
  - **trueTrackingData** `object`
- **request_id** `string`

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1.0/webhook-subscriptions`

**Retrieve Webhook Subscriptions**

> [!NOTE] > **Required role** — Get Webhook Subscriptions Retrieve all non-deleted webhook subscriptions for the account.

tags: `Webhook Subscriptions`

### Respuestas

**`200`** — Successful response.

- **result** `WebhookSubscription[]`
  - `array` de:
    - **externalId** `string` — Opaque identifier of the subscription.
    - **name** `string`
    - **targetUrl** `string` — Public `http`/`https` URL where the event payloads are sent via POST.
    - **eventTypes** `string[]`
      - `array` de:
    - **state** `string` · valores: `ACTIVE`, `DELETED`, `AUTOMATIC_PAUSED`, `MANUALLY_PAUSED`
    - **secretKey** `string` — Secret used to validate the HMAC signature of delivered events. Returned once, in the create (`POST`) response; it is not included in the list (`GET`) response. It can also be found in the Hyros app under Settings → Integrations → Hyros Webhook Subscription.
    - **creationDate** `string` — Creation date, in UTC.
    - **lastDeliveryDate** `string` — Date of the last event delivery, in UTC. `null` if no event has been delivered yet.
- **request_id** `string`

```json
{
  "result": [
    {
      "externalId": "sub-2a475f6baf8f416bac9ff60e1a0fabb5",
      "name": "My CRM sync",
      "targetUrl": "https://example.com/hooks/hyros",
      "eventTypes": [
        "sale.attributed",
        "lead.opted.in"
      ],
      "state": "ACTIVE",
      "creationDate": "2026-07-09T14:28:15Z",
      "lastDeliveryDate": "2026-07-09T15:13:20Z"
    }
  ],
  "request_id": "c9e86849464545d9b6b24d8039fa38d8"
}
```

**`401`** — Unauthorized.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `POST /api/v1.0/webhook-subscriptions`

**Create Webhook Subscription**

> [!NOTE] > **Required role** — Create Webhook Subscriptions Create a webhook subscription. The subscription tells Hyros which event types to send, via **POST**, to the provided `targetUrl`. The response includes the generated `externalId` and the `secretKey` used to validate the HMAC signature of delivered events. The `secretKey` is returned only in this create response — store it, as it is not returned by the list endpoint.

tags: `Webhook Subscriptions`

### Request body — `application/json` (requerido)

- **name** `string` _requerido_ — Name of the subscription.
- **targetUrl** `string` _requerido_ — URL where the event payloads are sent. Must be a public `http`/`https` URL and cannot contain template placeholders like `{{placeholder}}`. Non-HTTP schemes and internal/private hosts (loopback, link-local, private RFC-1918 ranges, wildcard, multicast, and cloud-metadata addresses) are rejected.
- **eventTypes** `string[]` _requerido_ — Event types to subscribe to. Must contain at least one known event type.
  - `array` de:

```json
{
  "name": "My CRM sync",
  "targetUrl": "https://example.com/hooks/hyros",
  "eventTypes": [
    "sale.attributed",
    "lead.opted.in"
  ]
}
```

### Respuestas

**`200`** — Subscription created successfully.

- **result** `WebhookSubscription`
  - **externalId** `string` — Opaque identifier of the subscription.
  - **name** `string`
  - **targetUrl** `string` — Public `http`/`https` URL where the event payloads are sent via POST.
  - **eventTypes** `string[]`
    - `array` de:
  - **state** `string` · valores: `ACTIVE`, `DELETED`, `AUTOMATIC_PAUSED`, `MANUALLY_PAUSED`
  - **secretKey** `string` — Secret used to validate the HMAC signature of delivered events. Returned once, in the create (`POST`) response; it is not included in the list (`GET`) response. It can also be found in the Hyros app under Settings → Integrations → Hyros Webhook Subscription.
  - **creationDate** `string` — Creation date, in UTC.
  - **lastDeliveryDate** `string` — Date of the last event delivery, in UTC. `null` if no event has been delivered yet.
- **request_id** `string`

```json
{
  "result": {
    "externalId": "sub-2a475f6baf8f416bac9ff60e1a0fabb5",
    "name": "My CRM sync",
    "targetUrl": "https://example.com/hooks/hyros",
    "eventTypes": [
      "sale.attributed",
      "lead.opted.in"
    ],
    "state": "ACTIVE",
    "secretKey": "ssk-244e8d359f67456cb9efac27913283fb",
    "creationDate": "2026-07-09T14:28:15Z",
    "lastDeliveryDate": null
  },
  "request_id": "143d65f8d2654e16a9dab64b20176f9c"
}
```

**`400`** — Bad Request.

- **result** `string`
- **message** `string[]`
  - `array` de:

**`401`** — Unauthorized.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `DELETE /api/v1.0/webhook-subscriptions/{externalId}`

**Delete Webhook Subscription**

> [!NOTE] > **Required role** — Delete Webhook Subscriptions Delete a webhook subscription by its `externalId`.

tags: `Webhook Subscriptions`

### Parámetros

- **externalId** (`path`) `string` _requerido_ — Opaque identifier of the subscription to delete.

### Respuestas

**`200`** — Subscription deleted successfully.

- **request_id** `string`
- **result** `string`

**`400`** — Bad Request. Returned when the `externalId` does not exist for this account.

- **result** `string`
- **message** `string[]`
  - `array` de:

**`401`** — Unauthorized.

- **result** `string`
- **message** `string[]`
  - `array` de:

---

## `GET /api/v1/domains`

**Get Domains**

> [!NOTE] > **Required role** — Get Lead Clicks Retrieves a list of verified domains associated with the product. This endpoint is served under `/api/v1/` (not `/api/v1.0/` like the other endpoints).

tags: `Domains`

### Respuestas

**`200`** — List of verified domains.

- `array` de:

```json
[
  "domain1.example.com",
  "domain2.example.com"
]
```

**`401`** — Unauthorized.

- **result** `string`
- **message** `string[]`
  - `array` de:

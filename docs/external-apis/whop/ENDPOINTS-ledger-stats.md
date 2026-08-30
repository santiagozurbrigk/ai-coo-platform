---
title: "Whop Wallet Stats API — referencia de endpoints"
source: "https://docs.whop.com/openapi/ledger-stats.yaml"
generado_desde: "openapi/ledger-stats.yaml"
capturado: "2026-08-30"
---

# Whop Wallet Stats API — referencia de endpoints

Estadísticas financieras de la cuenta (`/api/v1/stats/*`).

- Versión declarada: `1.0.0`
- Server: `https://api.whop.com`
- Auth `bearerAuth`: http / bearer
- Spec original: [`./openapi/ledger-stats.yaml`](./openapi/ledger-stats.yaml)

## Descripción del proveedor

Financial stats for your account.

## Índice de endpoints

| Método | Path | Qué hace |
| --- | --- | --- |
| `GET` | [`/api/v1/stats/schema`](#get-api-v1-stats-schema) | Describe available filters |
| `GET` | [`/api/v1/stats/time_series`](#get-api-v1-stats-time-series) | Query time series |

---

## `GET /api/v1/stats/schema`

**Describe available filters**

Returns the full structure of reporting categories, groupings, and line categories with human-readable descriptions. Use this to discover valid filter values for the time_series endpoint and understand what each value means. **Call this first** before constructing time_series queries to understand the available filters and what financial data each one represents.

`operationId`: `getStatsSchema`

### Parámetros

- **resource_type** (`query`) `string` _requerido_ — The type of resource to query. Currently only `wallet` is supported. · valores: `wallet`

### Respuestas

**`200`** — Full taxonomy of wallet stats filter values.

- **reporting_categories** `object[]` — Predefined report scopes. Each maps to a curated set of line categories. Pass a reporting_category name to the time_series endpoint to filter to that scope.
  - `array` de:
    - **name** `string` _requerido_ — The reporting_category value to pass to time_series.
    - **line_categories** `string[]` _requerido_ — The line_category keys included in this report.
      - `array` de:
- **groupings** `object[]` — Logical groupings of line categories (e.g. payments, refunds, disputes). Pass grouping names to the time_series endpoint to filter by grouping.
  - `array` de:
    - **name** `string` _requerido_ — The grouping value to pass to time_series.
    - **line_categories** `string[]` _requerido_ — The active line_category keys in this grouping.
      - `array` de:
- **line_categories** `object[]` — Every active line category with its description, grouping, and which reporting categories it belongs to. This is the most granular filter available on the time_series endpoint.
  - `array` de:
    - **key** `string` _requerido_ — The line_category value to pass to time_series.
    - **description** `string` _requerido_ — Human-readable explanation of what this line category represents.
    - **grouping** `string` _requerido_ — Which grouping this line category belongs to.
    - **reporting_categories** `string[]` _requerido_ — Which reporting categories include this line category.
      - `array` de:

```json
{
  "reporting_categories": [
    {
      "name": "gross_income",
      "line_categories": [
        "payment_gross",
        "passthrough_gmv",
        "platform_balance_transfer_incoming"
      ]
    }
  ],
  "groupings": [
    {
      "name": "payments",
      "line_categories": [
        "psp_payment_receivable",
        "payment_gross",
        "topup"
      ]
    }
  ],
  "line_categories": [
    {
      "key": "payment_gross",
      "description": "A settlement for a card or lpm payment into a wallet. This is the gross amount of the payment, not including any fees.",
      "grouping": "payments",
      "reporting_categories": [
        "net_activity",
        "gtv",
        "gross_income",
        "net_income"
      ]
    }
  ]
}
```

**`400`** — Invalid parameters (missing or invalid resource_type).

- **error** `object`
  - **type** `string`
  - **message** `string`

---

## `GET /api/v1/stats/time_series`

**Query time series**

Stats expose aggregated time series built from your account, the same data that powers the Whop dashboard charts. Each query rolls financial activity into periods (`group_by` day, week, or month) over the `from`–`to` window and returns the total `amount` and `line_count` for each, so you can chart revenue, refunds, fees, or net activity without reconstructing raw transactions. Set `resource_type` to choose what you're measuring (ex. `wallet`), pass `account_id` to read a sub-account, and narrow with `reporting_category`, `grouping`, and `line_category` (applied in that order).

`operationId`: `getStatsTimeSeries` · seguridad: `bearerAuth`

### Parámetros

- **resource_type** (`query`) `string` _requerido_ — The type of resource to query. Currently only `wallet` is supported. · valores: `wallet`
- **account_id** (`query`) `string` — Query a specific account's wallet instead of the caller's own. Pass a `biz_` or `user_` tag. The caller must have `company:balance:read` permission on the target account.
- **from** (`query`) `string` _requerido_ — Start date in ISO 8601 format.
- **to** (`query`) `string` _requerido_ — End date in ISO 8601 format.
- **group_by** (`query`) `string` — Time bucket granularity. · valores: `day`, `week`, `month` · default: `month`
- **reporting_category** (`query`) `string` — Filter to a predefined reporting category. Each category maps to a curated set of line categories. Call `/stats/schema?resource_type=wallet` to see all reporting categories and which line categories each one includes.
- **grouping** (`query`) `string[]` — Filter to specific groupings. Pass multiple values to include several (e.g. `grouping[]=payments&grouping[]=refunds`). Call `/stats/schema?resource_type=wallet` to see all groupings and which line categories belong to each.
- **line_category** (`query`) `string[]` — Filter to specific transaction types. Pass multiple values to include several (e.g. `line_category[]=payment_gross&line_category[]=payment_refund`). When omitted, all categories are included. Call `/stats/schema?resource_type=wallet` to see all line categories with descriptions.
- **currency** (`query`) `string` — Filter to only include rows denominated in this currency. When omitted, rows for all currencies are returned and a `currency` field appears on each row.
- **convert_currency** (`query`) `string` — Convert all amounts to this currency using historical exchange rates, collapsing multi-currency rows into one row per period. Can be combined with `currency` to first filter then convert.
- **timezone** (`query`) `string` — IANA timezone for period boundaries. · default: `UTC`

### Respuestas

**`200`** — Time-series data with metadata.

- **data** `object[]`
  - `array` de:
    - **period** `string` _requerido_ — Start date of the time bucket. · formato: `date`
    - **amount** `number` _requerido_ — Total amount for this period.
    - **line_count** `integer` _requerido_ — Number of ledger lines in this period.
    - **currency** `string` — Currency code for this row. Present when neither `currency` nor `convert_currency` is set, or when `currency` filters to a single currency without conversion.
- **metadata** `object`
  - **wallet_id** `string` — The ledger account tag resolved from your API key's auth context.
  - **account_id** `string` — Present when account_id was passed as a query parameter.
  - **from** `string` · formato: `date`
  - **to** `string` · formato: `date`
  - **group_by** `string` · valores: `day`, `week`, `month`
  - **currency** `string` — The currency filter applied, if any.
  - **convert_currency** `string` — The target conversion currency, if any.
  - **timezone** `string`
  - **reporting_category** `string` — Present only when the `reporting_category` query param is provided.
  - **base_reporting_scope** `string` — The base reporting scope applied to external API keys (e.g. `net_activity`). Absent for admin dashboard sessions.
  - **grouping** `string[]` — Present only when the `grouping` query param is provided.
    - `array` de:
  - **line_category** `string[]` — Present only when the `line_category` query param is provided.
    - `array` de:

```json
{
  "data": [
    {
      "period": "2025-01-01",
      "amount": 14550.35,
      "line_count": 342
    },
    {
      "period": "2025-02-01",
      "amount": 18200.0,
      "line_count": 410
    }
  ],
  "metadata": {
    "wallet_id": "ldgr_xxx",
    "from": "2025-01-01",
    "to": "2025-06-01",
    "group_by": "month",
    "currency": "usd",
    "timezone": "UTC"
  }
}
```

**`400`** — Invalid parameters.

- **error** `object`
  - **type** `string`
  - **message** `string`

**`401`** — Missing or invalid API key.

- **error** `object`
  - **type** `string`
  - **message** `string`

**`403`** — API key lacks `company:balance:read` permission, or `account_id=global` without admin access.

- **error** `object`
  - **type** `string`
  - **message** `string`

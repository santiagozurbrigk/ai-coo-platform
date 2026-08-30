---
title: "Rate Limits & Pagination"
source: "https://commasdocs.com/#rate-limits"
seccion: "Conceptos de la API"
ancla: "#rate-limits"
capturado: "2026-08-30"
---

# Rate Limits & Pagination

### Rate Limiting

The Commas API enforces rate limits to protect platform stability. The **checkout-sessions** and **customers** endpoint groups return rate-limit headers on every response:

| Header | Meaning |
| --- | --- |
| `X-RateLimit-Limit` | Maximum requests allowed in the current window. |
| `X-RateLimit-Remaining` | Requests you have left in the window. |
| `X-RateLimit-Reset` | When the window resets. |

When you exceed the limit, the API returns HTTP `429 Too Many Requests`. Note the 429 body uses a different envelope than other errors — `{"success": false, …}` instead of `{"status": "error", …}` — so don't key your error handling solely on the `status` field.

ℹ Rate limit thresholds

Specific rate limit thresholds vary by account and endpoint. Contact [support@fanbasis.com](mailto:support@fanbasis.com) for the limits that apply to your account.

✓ Best Practice

Implement exponential backoff when you receive a 429 response. Check the `Retry-After` header included in the response for how long to wait before retrying.

### Pagination

All list endpoints (customers, transactions, subscribers, discount codes, products) return paginated results. Use the `page` and `per_page` parameters to navigate through result sets. There are no `sort` or `order` parameters — ordering is fixed per endpoint.

#### Query Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer | Optional | The page number to retrieve. Starts at 1. |
| `per_page` | integer | Optional | Number of records per page. Maximum value is 100. |

#### Paginated Response Structure

Response — List Endpoint

```json
{
  "status": "success",
  "data": {
    "customers": [ ...array of items... ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total_items": 142,
      "total_pages": 15,
      "has_more": true
    }
  }
}⎘ Copy
```

⚠ It's

`data.pagination`

, not

`meta`

The items live under `data.<resource>` — `customers`, `transactions`, `subscribers`, `subscriptions` — and the page info under `data.pagination`. There is no top-level `meta` object and no `has_next_page` / `has_prev_page`; use `data.pagination.has_more`.

ℹ Two endpoints use a raw Laravel paginator

`GET /public-api/discount-codes` and `GET /public-api/products` return Laravel's own paginator shape instead: `data.current_page`, `data.data[]`, `data.total`, `data.per_page`, `data.next_page_url`, … with no `pagination` sub-object.

#### Iterating All Pages — Example

```js
async function getAllCustomers(apiKey) {
  const allCustomers = [];
  let page = 1;
  let hasMore = true;
 
  while (hasMore) {
    const res = await fetch(
      `https://www.fanbasis.com/public-api/customers?page=${page}&per_page=100`,
      { headers: { 'x-api-key': apiKey } }
    );
    const json = await res.json();
    allCustomers.push(...json.data.customers);
    hasMore = json.data.pagination.has_more;
    page++;
  }
 
  return allCustomers;
}
```

> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Api overview

This documentation describes Fathom's REST API.

## Authentication

All REST API resources are authenticated with API keys generated via the Fathom website's settings area.

## Rate limiting

We use several rate limiting strategies to ensure the availability of our APIs. Rate-limited calls to our APIs return a 429 status code. Calls to our APIs include headers indicating the current rate limit status.

### Global rate limits

Authenticated requests are subject to a global limit. This is the maximum number of calls that your account can make to the API per minute. Endpoints subject to rate limits may return the headers below.

| Header                | Description                                                               |
| --------------------- | ------------------------------------------------------------------------- |
| `RateLimit-Limit`     | The maximum number of requests allowed in a time window                   |
| `RateLimit-Remaining` | The number of requests remaining in the current time window               |
| `RateLimit-Reset`     | The time remaining in the current time window                             |
| `Retry-After`         | The number of seconds to wait before retrying. Only sent on 429 responses |

Currently, you are able to make a maximum of 60 calls to the API in a 60 second window.

The official SDKs automatically retry rate-limited requests, waiting for the duration indicated by the `Retry-After` header. If you are calling the API directly, wait at least `Retry-After` seconds before retrying a 429 response.

### Heavy Requests rate limits

For heavy requests, the maximum allowed number of calls is 30 in a 60 second window.
During periods of elevated activity this limit may be adjusted down to 5 every 60 seconds.

Heavy requests are:

* Requests to the /recordings summary and transcript endpoints
* Requests to /meetings that set include\_summary or include\_transcript to true

### Recording download rate limits

Requesting a recording download has its own limit, separate from heavy requests: 30 calls in a 60 second window.
During periods of elevated activity this limit may be adjusted.

Polling a download's status counts against the global limit.

### OAuth Rate Limits

60 requests per 60 seconds per OAuth app for the `https://api.fathom.ai/external/v1/oauth2/token` endpoint

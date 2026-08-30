---
title: "Release Notes"
source: "https://vturb.gitbook.io/analytics-api/release-notes"
idioma: "en"
capturado: "2026-08-30"
---

# Release Notes

### Version 1.7.1 (2026-05-07)

#### Bug Fixes

* **`/headlines/stats_by_player`, `/turbo/stats_by_player`, `/smart_autoplays/stats_by_player` now honor `end_date`**: These three endpoints silently dropped the `end_date` parameter and always returned data from `start_date` through "now," producing inflated near-cumulative totals — most visibly when callers requested a short, historical window. `end_date` is now applied as an upper bound on `events.created_at`, `sessions.created_at`, `times.created_at`, and `conversions.click_created_at`. The bound is inclusive at the end of the minute, so passing `23:59:59` (or `23:59:59.999`) for the last minute of a day correctly captures every event in that day. `end_date` remains optional — callers that omit it (or send it blank) get the previous unbounded behavior, so existing integrations are not affected; if `end_date` is present but malformed the request returns `400`.

***

### Version 1.7.0 (2026-04-27)

#### New Features

* **New `GET /quota/usage` endpoint**: Returns the live ClickHouse quota state for your API key — one entry per quota interval (typically a per-minute and a per-day bucket). For each interval you get `interval_seconds`, `interval_starts_at`, `interval_ends_at`, and `{ used, limit, remaining }` for both `queries` and `read_bytes`. Use it from your client to self-rate-limit before issuing expensive analytics requests.

  Notes:

  * When ClickHouse defines a quota as unlimited (raw value `0`), the response surfaces `limit: null` and `remaining: null` so you don't divide by zero.
  * A single API call may count as more than one query against `max_queries_per_minute`, so this counter can climb faster than your request rate. The response includes `queries.note` to flag this. `read_bytes` reflects the actual data scanned and is the more reliable signal for sizing your usage.
  * The endpoint itself counts as 1 query against `max_queries_per_minute`.

  ```
  GET /quota/usage
  ```

  ```json
  {
    "quotas": [
      {
        "interval_seconds": 60,
        "interval_starts_at": "2026-04-27T12:34:00Z",
        "interval_ends_at":   "2026-04-27T12:35:00Z",
        "queries":    { "used": 20, "limit": 60, "remaining": 40, "note": "a single API request may count as more than one query against this limit" },
        "read_bytes": { "used": 92535478, "limit": null, "remaining": null }
      }
    ]
  }
  ```

#### Enhancements

* **Structured `details` on `429 Too Many Requests`**: When a request fails because the API key has exhausted a ClickHouse quota (`code: 201`), the response now includes a `details` object alongside the existing `error` text:

  ```json
  {
    "error": "Query quota exceeded for this API key. ...",
    "code": 201,
    "details": {
      "limit_kind": "queries",
      "used": 60,
      "limit": 60,
      "remaining": 0,
      "interval_seconds": 60,
      "resets_at": "2026-04-27T12:35:00Z"
    }
  }
  ```

  The previous `error` and `code` fields are unchanged, so existing clients keying off them keep working. SDKs and dashboards can now show "retry after `resets_at`" instead of treating the throttle as opaque.

***

### Version 1.6.0 (2026-04-27)

#### New Features

* **Name search on `/players/list`**: The endpoint now accepts an optional `name` filter and an optional `name_match` mode (`contains` (default), `starts_with`, `ends_with`, or `exact`). Search is case-insensitive — including for diacritics (`JOSÉ` matches `José Silva`). Special characters like `%`, `_`, `\`, and `[]` are matched literally, so a query such as `name=[campaign_1]` returns only players whose names contain that exact tag. `name` must be **between 3 and 128 characters** after trimming whitespace; sending `name_match` without `name` returns 400.

**Example usage**

```
GET /players/list?name=campaign_1
GET /players/list?name=BF&name_match=starts_with
GET /players/list?name=_v2&name_match=ends_with
GET /players/list?name=[VSL]%20Black%20Friday&name_match=exact
```

### Version 1.5.0 (2026-04-20)

#### New Features

* **New `/comparison_groups/list` endpoint**: Lists the AB tests (comparison groups) registered for your company. Each entry includes the test name, the players enrolled with their traffic percentages, and the start/finish timestamps. Results are sorted by creation date (newest first) and can be narrowed down with optional `start_date` / `end_date` filters.
* **New `/comparison_groups/stats` endpoint**: Returns the full set of analytics metrics for up to **2** players of an AB test in a single request — views, plays, finishes, clicks, conversions (with revenue in USD, BRL, and EUR), engagement, pitch retention, and the derived play rate, conversion rate, and revenue per visitor (RPV). Each item's `start_date` is optional — when omitted, it falls back to the player's own `started_at` (from the AB test's players list) and, if that is not set, to the comparison group's `started_at`. When `end_date` is omitted, results run through the current time.

**Request**

* Up to 2 `items` per request (AB tests are compared pairwise).
* Each item: `{ player_id (required), start_date (YYYY-MM-DD HH:MM:SS, optional), end_date (optional) }`.
* `events` is optional and defaults to `["started", "viewed", "finished"]`.
* `timezone` is optional (defaults to `Etc/UTC`). When set, every `start_date` / `end_date` string — the ones you pass in `items`, and the defaults resolved from the comparison group — is interpreted in this timezone when the query runs.

**Response**

```json
{
  "comparison_group": {
    "id": "...",
    "name": "...",
    "player_ids": [
      "...",
      "..."
    ],
    "started_at": "2026-02-26 00:41:00",
    "finished_at": null
  },
  "stats": [
    {
      "player_id": "...",
      "pitch_time": 1317,
      "video_duration": 1732,
      "views": {
        "total": 12626,
        "total_uniq_sessions": 11491,
        "total_uniq_device": 11411
      },
      "plays": {
        "total": 9984,
        "total_uniq_sessions": 9587,
        "total_uniq_device": 9574
      },
      "finishes": {
        "total": 286,
        "total_uniq_sessions": 284,
        "total_uniq_device": 283
      },
      "clicks": {
        "total": 515,
        "total_uniq_sessions": 488,
        "total_uniq_device": 485
      },
      "conversions": {
        "total": 17,
        "total_uniq_sessions": 17,
        "total_uniq_device": 17,
        "total_amount_usd": 3740.0,
        "total_amount_brl": 19329.57,
        "total_amount_eur": 3179.82
      },
      "engagement": {
        "average_watched_time": 842.3,
        "engagement_rate": 48.63,
        "grouped_timed": [
          {
            "timed": 0,
            "total_users": 1420
          },
          {
            "timed": 5,
            "total_users": 980
          }
        ]
      },
      "pitch_audience": 2411,
      "pitch_retention_rate": 23.57,
      "play_rate": 83.89,
      "conversion_rate": 0.18,
      "rpv_usd": 0.3907,
      "rpv_brl": 2.019,
      "rpv_eur": 0.3322
    }
  ]
}
```

* `comparison_group.player_ids` returns every player registered in the AB test, even if you request stats for only a subset.
* Items whose `player_id` is not part of the comparison group are silently dropped; the request fails with `422` only when no valid item remains.
* A `comparison_group_id` that does not belong to your account returns `404`.
* Revenue fields (`conversions.total_amount_{usd,brl,eur}` and `rpv_{usd,brl,eur}`) are returned in major currency units (dollars, reais, euros) as floats — e.g. `3740.0` means USD $3,740.00.

**Example usage**

```bash
# 1. List the company's AB tests
curl -X POST https://{host}/comparison_groups/list \
  -H 'X-Api-Token: <token>' \
  -H 'X-Api-Version: v1' \
  -H 'Content-Type: application/json' \
  -d '{"start_date":"2026-01-01 00:00:00"}'

# 2. Pull stats for up to 2 players
curl -X POST https://{host}/comparison_groups/stats \
  -H 'X-Api-Token: <token>' \
  -H 'X-Api-Version: v1' \
  -H 'Content-Type: application/json' \
  -d '{
        "comparison_group_id": "699f9683dfeab82d6246e13b",
        "items": [
          {"player_id": "699f92f01dd8bb9e2b6aab3a", "start_date": "2026-02-26 00:41:00"},
          {"player_id": "699f9363c4b02ade5c5f1881", "start_date": "2026-02-26 00:41:00"}
        ]
      }'
```

***

### Version 1.4.1 (2025-08-01)

#### Bug Fixes

* **The `/sessions/live_users` endpoint** had a problem in which the caching was being maintained for 60 minutes as a default. The fix includes a cache now that uses a 30 seconds cache with a 15 seconds revalidation strategy. This should be enough for querying live users.

***

### Version 1.4.0 (2025-07-29)

#### New Features

* **New `/sessions/live_users` endpoint**: Added real-time live user tracking functionality that provides domain-based analytics of currently active users:
  * **Real-time activity tracking**: Monitors user activity within a configurable time window (1-720 minutes)
  * **Domain-based grouping**: Groups live users by domain to understand traffic distribution
  * **Session validation**: Only counts sessions from the last 12 hours with recent activity
  * **Bot filtering**: Automatically excludes bot traffic for accurate user counts
  * **Ordered results**: Returns domains sorted by live user count in descending order

**Example Usage**

```bash
# Get live users from the last 60 minutes (default)
GET /sessions/live_users?player_id=64a5c8072e6fd10009828db2

# Get live users from the last 30 minutes
GET /sessions/live_users?player_id=64a5c8072e6fd10009828db2&minutes=30

# Get live users from the last 2 hours
GET /sessions/live_users?player_id=64a5c8072e6fd10009828db2&minutes=120
```

**Parameter Details**

* **`player_id`** (required): The ID of the player to monitor for live user activity
* **`minutes`** (optional): Time window in minutes to consider recent activity. Must be between 1 and 720. Defaults to 60 minutes

**Response Format**

```json
[
  {
    "domain": "example.com",
    "live_users": 15
  },
  {
    "domain": "test.com",
    "live_users": 8
  },
  {
    "domain": "another-site.com",
    "live_users": 3
  }
]
```

**Understanding Live User Tracking**

The endpoint works by:

1. **Session Filtering**: Identifies sessions from the last 12 hours that are not from bots
2. **Activity Validation**: Checks for recent activity (times records) within the specified minutes window
3. **Domain Grouping**: Groups active sessions by domain
4. **Count Aggregation**: Counts unique sessions per domain to determine live user count
5. **Result Ordering**: Returns domains sorted by live user count (highest first)

**Error Handling**

* **400 Bad Request**: Returns detailed error messages for invalid parameters:
  * Invalid player\_id format
  * Minutes outside valid range (1-720)
* **401 Unauthorized**: Maintains existing authentication requirements

**Use Cases**

This endpoint enables you to:

* **Real-time monitoring**: Track current user engagement across different domains
* **Traffic analysis**: Understand which domains are driving the most active users
* **Performance optimization**: Identify high-traffic domains for resource allocation
* **Marketing insights**: Monitor campaign effectiveness in real-time
* **Operational decisions**: Make immediate decisions based on current user activity
* **Alert systems**: Build monitoring systems for unusual traffic patterns

***

### Version 1.3.0 (2025-07-18)

#### New Features

* **Enhanced `/players/list` endpoint with date filtering**: Added optional query parameters for better player filtering capabilities:
  * **Date range filtering**: Added `start_date` and `end_date` parameters to filter players by creation date
  * **Timezone support**: Added `timezone` parameter for accurate date filtering across different time zones
  * **Parameter validation**: Added comprehensive validation for date parameters to ensure proper datetime format
  * **Backward compatibility**: All new parameters are optional, ensuring existing integrations continue to work unchanged

**Key Features**

The enhanced `/players/list` endpoint now supports:

* **Date filtering**: Filter players created within a specific date range using `start_date` and `end_date` parameters
* **Timezone awareness**: Specify timezone for accurate date calculations (defaults to UTC if not provided)

**Example Usage**

```bash
# Basic request (unchanged)
GET /players/list

# Filter players created in the last 30 days
GET /players/list?start_date=2023-10-01&end_date=2023-10-31

# Filter with timezone specification
GET /players/list?start_date=2023-10-01 00:00:00&end_date=2023-10-31 23:59:59&timezone=America/Sao_Paulo

# Filter players created after a specific date
GET /players/list?start_date=2023-10-01&timezone=America/Sao_Paulo
```

**Parameter Details**

* **`start_date`** (optional): Start date of the period for player filtering. Uses >= comparison. Supports formats like "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC"
* **`end_date`** (optional): End date of the period for player filtering. Uses <= comparison. Same date formats as start\_date
* **`timezone`** (optional): Timezone to use for date filtering. Defaults to 'Etc/UCT' if not specified

**Response Format**

The response format remains unchanged, ensuring backward compatibility:

```json
[
  {
    "id": "player1",
    "name": "My Player",
    "pitch_time": 0,
    "duration": 3600,
    "created_at": "2025-07-18T10:00:00Z"
  }
]
```

**Use Cases**

This enhancement enables you to:

* **Time-based analytics**: Filter players created within specific campaigns or time periods
* **Reporting**: Generate reports for players created during specific business periods
* **Auditing**: Track player creation patterns over time
* **Data management**: Efficiently query players based on creation timestamps

***

### Version 1.2.0 (2025-06-27)

#### New Features

* **New `/sessions/stats_by_day` endpoint**: Added comprehensive daily session analytics that provides detailed statistics broken down by day within a specified date range.

**Key Features**

The `/sessions/stats_by_day` endpoint provides:

* **Daily session metrics**: Total views, starts, finishes, and clicks aggregated by day
* **Unique user tracking**: Separate counts for unique sessions and unique devices across all metrics
* **Engagement analysis**: Engagement rate calculations based on average watch time
* **Pitch threshold analysis**: Tracks users who watched above/below the pitch time threshold
* **Conversion tracking**: Daily conversion counts with amounts in multiple currencies (USD, BRL, EUR)
* **Play rate calculation**: Percentage of viewers who started playing after viewing
* **Date range filtering**: Flexible date filtering with timezone support

**Example Request**

```json
{
  "player_id": "65fb3c74ab21c70007b3e0dd",
  "start_date": "2023-01-01",
  "end_date": "2023-01-31",
  "timezone": "America/Sao_Paulo",
  "video_duration": 3600,
  "pitch_time": 30
}
```

**Example Response**

```json
[
  {
    "date_key": "2023-01-01",
    "total_viewed": 200,
    "total_viewed_device_uniq": 180,
    "total_viewed_session_uniq": 190,
    "total_started": 250,
    "total_started_session_uniq": 230,
    "total_started_device_uniq": 220,
    "total_finished": 150,
    "total_finished_session_uniq": 140,
    "total_finished_device_uniq": 130,
    "engagement_rate": 75.56,
    "total_clicked": 50,
    "total_clicked_device_uniq": 45,
    "total_clicked_session_uniq": 40,
    "total_over_pitch": 30,
    "total_under_pitch": 10,
    "over_pitch_rate": 75.0,
    "total_conversions": 10,
    "overall_conversion_rate": 2.56,
    "total_amount_usd": 1000,
    "total_amount_brl": 1000,
    "total_amount_eur": 1000,
    "play_rate": 2.56
  },
  {
    "date_key": "2023-01-02",
    "total_viewed": 180,
    "total_viewed_device_uniq": 160,
    "total_viewed_session_uniq": 170,
    "total_started": 220,
    "total_started_session_uniq": 210,
    "total_started_device_uniq": 200,
    "total_finished": 130,
    "total_finished_session_uniq": 120,
    "total_finished_device_uniq": 110,
    "engagement_rate": 72.3,
    "total_clicked": 40,
    "total_clicked_device_uniq": 35,
    "total_clicked_session_uniq": 30,
    "total_over_pitch": 25,
    "total_under_pitch": 8,
    "over_pitch_rate": 75.76,
    "total_conversions": 8,
    "overall_conversion_rate": 2.27,
    "total_amount_usd": 800,
    "total_amount_brl": 800,
    "total_amount_eur": 800,
    "play_rate": 2.27
  }
]
```

**Understanding the Daily Metrics**

The `/sessions/stats_by_day` endpoint provides detailed daily breakdowns of:

* **Session Metrics**: Comprehensive view, start, finish, and click counts for each day
* **Unique Tracking**: Separate unique counts by session and device to understand user behavior
* **Engagement Analysis**: Daily engagement rates showing how much of the video users are watching
* **Pitch Performance**: Daily analysis of how many users watch beyond your pitch threshold
* **Conversion Tracking**: Complete conversion data with monetary amounts across multiple currencies
* **Trend Analysis**: Day-by-day comparison to identify patterns and trends

**Use Cases**

This endpoint enables you to:

* **Track daily performance trends**: Monitor how engagement varies day by day
* **Identify peak performance days**: Find which days generate the most engagement and conversions
* **Analyze seasonal patterns**: Understand how user behavior changes over time
* **Campaign performance tracking**: Measure the daily impact of marketing campaigns
* **Content optimization**: Identify which days have higher engagement rates for content planning
* **Conversion analysis**: Track daily conversion patterns and revenue trends
* **User behavior insights**: Understand viewing patterns across different days of the week or month

***

### Version 1.1.0 (2025-06-25)

#### New Features

* Enhanced `/custom_metrics/list` endpoint with significant improvements:
  * **New POST method**: Added a POST endpoint at `/custom_metrics/list` for better parameter handling
  * **Engagement rate calculation**: Now calculates and returns engagement rates for each custom metric
  * **Date range filtering**: Added optional `start_date` and `end_date` parameters to filter metrics by time period
  * **Timezone support**: Added timezone parameter for accurate date filtering across different time zones
  * **Enhanced user analytics**: Returns `total_users`, `users_above`, and `engagement_rate` for each custom metric

**Migration Path**

The original GET endpoint `/custom_metrics/{player_id}/list` is now **deprecated** and will be removed on **July 25, 2025**. Please migrate to the new POST endpoint.

**Example Request (New POST Method)**

```json
{
  "player_id": "64a5c8072e6fd10009828db2",
  "start_date": "2023-01-01 00:00:00",
  "end_date": "2023-12-31 23:59:59",
  "timezone": "America/Sao_Paulo"
}
```

**Example Response (Enhanced with Engagement Data)**

```json
[
  {
    "id": "685acdfa39be67017b9be72d",
    "name": "Custom Metric 1",
    "time": 600,
    "sequential_number": 1,
    "engagement_rate": 18.18,
    "total_users": 55,
    "users_above": 10
  },
  {
    "id": "685acdfa39be67017b9be72e",
    "name": "Custom Metric 2",
    "time": 1200,
    "sequential_number": 2,
    "engagement_rate": 12.73,
    "total_users": 55,
    "users_above": 7
  }
]
```

**Understanding the New Metrics**

The enhanced endpoint now provides detailed engagement analytics:

* **`engagement_rate`**: Percentage of users who watched beyond the custom metric timestamp
* **`total_users`**: Total number of users who watched the video in the specified time period
* **`users_above`**: Number of users who watched beyond this custom metric's timestamp
* **Date filtering**: When `start_date` and `end_date` are provided, analytics are calculated only for sessions within that period
* **Timezone awareness**: Dates are properly handled according to the specified timezone

**Use Cases**

This enhancement enables you to:

* **Analyze retention over time**: Compare engagement rates for the same custom metrics across different time periods
* **Track seasonal patterns**: Use date filtering to understand how user engagement varies by season or campaign periods
* **Calculate precise retention rates**: Get exact percentages of users reaching each custom milestone
* **Generate time-based reports**: Create periodic reports showing engagement trends at key video moments
* **A/B testing**: Compare engagement rates for different video versions or marketing campaigns

#### Breaking Changes

* **Deprecation Notice**: The GET endpoint `/custom_metrics/{player_id}/list` is deprecated and will be removed on July 25, 2025
* **Migration Required**: Applications using the GET endpoint should migrate to the new POST endpoint by the deprecation date

***

### Version 1.0.9 (2025-06-24)

#### New Features

* Added new `/sessions/stats` endpoint that provides comprehensive session statistics for a specific player:
  * Returns detailed session metrics including total views, starts, finishes, and clicks
  * Provides unique session and device counts for each metric type
  * Calculates engagement rates and conversion metrics
  * Includes pitch time analysis showing users who watched above/below pitch threshold
  * Returns conversion data with amounts in multiple currencies (USD, BRL, EUR)
  * Supports date range filtering and timezone configuration

**Example Request**

```json
{
  "player_id": "65fb3c74ab21c70007b3e0dd",
  "start_date": "2023-01-01",
  "end_date": "2024-01-31",
  "timezone": "America/Sao_Paulo",
  "video_duration": 3600,
  "pitch_time": 30
}
```

**Example Response**

```json
{
  "total_viewed": 200,
  "total_viewed_device_uniq": 180,
  "total_viewed_session_uniq": 190,
  "total_started": 250,
  "total_started_session_uniq": 230,
  "total_started_device_uniq": 220,
  "total_finished": 150,
  "total_finished_session_uniq": 140,
  "total_finished_device_uniq": 130,
  "engagement_rate": 75.56,
  "total_clicked": 50,
  "total_clicked_device_uniq": 45,
  "total_clicked_session_uniq": 40,
  "total_over_pitch": 30,
  "total_under_pitch": 10,
  "over_pitch_rate": 75,
  "total_conversions": 10,
  "overall_conversion_rate": 2.56,
  "total_amount_usd": 1000,
  "total_amount_brl": 1000,
  "total_amount_eur": 1000,
  "play_rate": 2.56
}
```

**Understanding the Metrics**

The `/sessions/stats` endpoint provides several key metrics:

* **View Metrics**: Total views and unique views by session and device
* **Engagement Metrics**: Start/finish rates and overall engagement percentages
* **Pitch Analysis**: Shows how many users watched beyond the configured pitch time threshold
* **Conversion Data**: Complete conversion metrics with monetary amounts in multiple currencies
* **Play Rate**: Percentage of viewers who started playing the video after viewing

This endpoint is particularly useful for:

* Getting a comprehensive overview of player performance
* Analyzing user engagement patterns
* Understanding conversion effectiveness
* Tracking retention at the pitch threshold
* Comparing performance across different time periods

***

### Version 1.0.8 (2025-06-17)

#### Improvements

* Fixed an issue where sometimes during the fetch of the players listing (`/players/list`) some values could duplicate

***

### Version 1.0.7 (2025-06-05)

#### Improvements

* Enhanced `/players/list` endpoint with additional player information:
  * Added `pitch_time` field to show the player's pitch time configuration
  * Added `duration` field to display the associated video's duration
  * Maintains backward compatibility with existing implementations

**Example Response**

```json
[
  {
    "id": "player1",
    "name": "My Player",
    "pitch_time": 0,
    "duration": 3600,
    "created_at": "2025-06-05T10:00:00Z"
  }
]
```

***

### Version 1.0.6 (2025-05-30)

#### New Features

* Added new `/custom_metrics/{player_id}/list` endpoint that provides a list of all custom metrics for a specific player:
  * Returns custom metric information including ID, name, time, and sequential number
  * Allows tracking specific video time points for retention analysis
  * Enables calculation of user engagement percentages at specific video timestamps

**Example Response**

```json
[
  {
    "id": "metric1",
    "name": "First Key Point",
    "time": 30,
    "sequential_number": 1
  },
  {
    "id": "metric2",
    "name": "Second Key Point",
    "time": 60,
    "sequential_number": 2
  }
]
```

**Understanding Custom Metrics and User Engagement**

The custom metrics endpoint works in conjunction with the `/times/user_engagement` endpoint to help calculate retention rates at specific video timestamps. Here's how to use them together:

1. First, list your custom metrics for important video timestamps using the `/custom_metrics/{player_id}/list` endpoint
2. Then, use the `/times/user_engagement` endpoint to get the number of users at each timestamp by providing:
   * `player_id`: The ID of your player
   * `video_duration`: Total duration of the video in seconds
   * `start_date` and `end_date`: The period you want to analyze
   * `timezone`: Your preferred timezone for date filtering

Example request to `/times/user_engagement`:

```json
{
  "start_date": "2023-10-26 18:24:05",
  "end_date": "2023-11-26 18:24:05",
  "player_id": "65fb3c74ab21c70007b3e0dd",
  "video_duration": 3600,
  "timezone": "America/Sao_Paulo"
}
```

3. The user engagement endpoint will return data showing how many users reached each second of the video
4. You can then calculate retention by comparing the number of users at each custom metric timestamp against the total number of users

For example, if you have:

* Total users: 100
* Users at 30 seconds (First Key Point): 80
* Users at 60 seconds (Second Key Point): 50

The retention rates would be:

* First Key Point: 80% (80/100)
* Second Key Point: 50% (50/100)

This combination allows you to:

* Track user engagement at specific, meaningful points in your video
* Calculate retention rates for custom-defined milestones
* Analyze how many users are reaching your key video moments
* Make data-driven decisions about video content and length

***

### Version 1.0.5 (2025-05-28)

#### New Features

* Added new `/players/list` endpoint that provides a list of all players belonging to the authenticated user's company:
  * Returns basic player information including ID, name, and creation date
  * Automatically filters players based on the authenticated user's company
  * Supports JSON response format

**Example Response**

```json
[
  {
    "id": "player1",
    "name": "My Player",
    "created_at": "2025-05-28T10:00:00Z"
  }
]
```

***

### Version 1.0.4 (2025-05-27)

#### New Features

* Added new `/events/leaderboard` endpoint that provides player rankings based on video engagement metrics:
  * Supports multiple leaderboards with different player limits in a single request
  * Allows filtering by event types (started, finished, viewed, clicked, paused)
  * Includes metrics for total plays, unique plays by session, and unique plays by device
  * Supports date range filtering with optional end date

**Example Request**

```json
{
  "company_id": "2b884cba-0b12-42ce-b3a1-7a3182d414df",
  "leaderboards": [
    {
      "leaderboard_limit": 10,
      "start_date": "2023-10-26",
      "end_date": "2023-11-26",
      "event": "finished"
    },
    {
      "leaderboard_limit": 5,
      "start_date": "2023-09-26",
      "event": "started"
    }
  ],
  "timezone": "America/Sao_Paulo"
}
```

**Example Response**

```json
[
  {
    "leaderboard_name": "leaderboard_10",
    "event": "finished",
    "leaderboards": [
      {
        "player_id": "player1",
        "total_plays": 100,
        "uniq_plays": 50,
        "uniq_device_plays": 25
      }
    ]
  }
]
```

***

### Version 1.0.3 (2025-05-15)

#### Improvements

* Improved performance on the following endpoints:
  * `/events/total_by_company_day`

**Detailed explanation**

Sometimes when performing a request against the endpoint users were reaching out of resource without the request actually being\
that heavy, this was due to the way the endpoint was aggregating data, requests should be normalized and use the proper amount of\
resource.

***

### Version 1.0.2 (2025-05-15)

#### Improvements

* Enhanced error handling for exceptions when the request is using more resources than it's allowed based on the company plan:
  * Added explicit handling for `AUTHENTICATION_FAILED`
  * Added explicit handling for `MEMORY_LIMIT_EXCEEDED`

**Examples of the Error Responses for 401 - Non Authorized**

When a company doesn't have access to the API:

```json
{
  "error": "This company does not have access to the public analytics API.",
  "code": 516
}
```

When a query exceeds the resource limits for the company plan tier:

```json
{
  "error": "Your api key tier is not enough to perform this query. Please contact support at contato@vturb.com.br",
  "code": 241
}
```

***

### Version 1.0.1 (2025-05-15)

#### Bug Fixes

* Fixed timezone handling in the `/sessions/stats_by_field_by_day` endpoint to ensure consistent date reporting across different timezones. This affects how dates are calculated in the following metrics:
  * Session statistics by day
  * Conversion rates
  * Event timestamps
  * Date-based aggregations

**Example of the Fix**

Before this fix, when using timezone "America/Sao\_Paulo" (GMT-3), events that occurred on the same day could be split across two different dates due to timezone conversion issues. For example:

```json
// Before the fix
{
    "grouped_field": "United States",
    "total_viewed": 100,
    "date_key": "2025-05-13"  // Some events from May 14 were incorrectly grouped here
},
{
    "grouped_field": "United States",
    "total_viewed": 200,
    "date_key": "2025-05-14"  // Only some events from May 14 were here
}
```

Now, all events from the same day are properly grouped together, regardless of the timezone specified in the request:

```json
// After the fix
{
  "grouped_field": "United States",
  "total_viewed": 300, // All events from May 14 are now correctly grouped
  "date_key": "2025-05-14"
}
```

***

*Note: This version includes fixes and improvements to existing functionality without introducing new features or breaking changes.*

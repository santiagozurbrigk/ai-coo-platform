---
title: "VTurb Analytics API — referencia de endpoints"
source: "https://vturb.gitbook.io/analytics-api/analytics"
generado_desde: "openapi.json (reconstruido a partir de los bloques OpenAPI embebidos en la doc)"
capturado: "2026-08-30"
---

# VTurb Analytics API — referencia de endpoints

Generado a partir de [`openapi.json`](./openapi.json), que a su vez se reconstruyó uniendo los
28 documentos OpenAPI 3.0.2 que la propia documentación de VTurb embebe, uno por endpoint.
**No hay ningún campo inventado acá: todo sale del spec publicado.**

- Server: `https://analytics.vturb.net`
- Versión declarada: `v3`
- Autenticación: headers `X-Api-Token` y `X-Api-Version` (ver [autenticación](./pt/01-autenticacao-da-api.md))

## Índice

| Método | Path | Qué devuelve |
| --- | --- | --- |
| `POST` | [`/clicks/total_by_company_day`](#post-clicks-total-by-company-day) | Returns the totals of clicks for each day in a company and player |
| `POST` | [`/clicks/total_by_company_timed`](#post-clicks-total-by-company-timed) | Returns the total of user clicks at a time in seconds related to the video |
| `POST` | [`/comparison_groups/list`](#post-comparison-groups-list) | List the AB tests (comparison groups) registered for the authenticated company |
| `POST` | [`/comparison_groups/stats`](#post-comparison-groups-stats) | Returns the full analytics metrics for up to 2 players of an AB test |
| `POST` | [`/conversions/active_platforms`](#post-conversions-active-platforms) | Returns the active platforms for a company |
| `POST` | [`/conversions/stats_by_day`](#post-conversions-stats-by-day) | Returns the totals of conversions for each day in a company and player |
| `POST` | [`/conversions/video_timed`](#post-conversions-video-timed) | Returns the conversions grouped by timed for a company and player |
| `POST` | [`/custom_metrics/list`](#post-custom-metrics-list) | List all custom metrics of a player |
| `POST` | [`/events/leaderboard`](#post-events-leaderboard) | Returns player leaderboards based on video engagement metrics |
| `POST` | [`/events/total_by_company`](#post-events-total-by-company) | Returns the number of times the events happened as well as the count considering unique device and sessions |
| `POST` | [`/events/total_by_company_day`](#post-events-total-by-company-day) | Returns the totals of the events for each day in a company |
| `POST` | [`/events/total_by_company_players`](#post-events-total-by-company-players) | Returns the totals of the events for each player in a company |
| `POST` | [`/headlines/stats_by_player`](#post-headlines-stats-by-player) | Statistics used by the headlines dashboard |
| `GET` | [`/players/list`](#get-players-list) | List all players |
| `GET` | [`/quota/usage`](#get-quota-usage) | Returns the live API quota usage for the authenticated company |
| `GET` | [`/sessions/live_users`](#get-sessions-live-users) | Returns the number of live users for a player |
| `POST` | [`/sessions/stats`](#post-sessions-stats) | Returns statistics of all sessions of a player |
| `POST` | [`/sessions/stats_by_day`](#post-sessions-stats-by-day) | Returns statistics of all sessions of a player by day |
| `POST` | [`/sessions/stats_by_field`](#post-sessions-stats-by-field) | Returns statistics grouped by a specified field |
| `POST` | [`/sessions/stats_by_field_by_day`](#post-sessions-stats-by-field-by-day) | Returns statistics grouped by a specified field broke by day |
| `POST` | [`/times/user_engagement`](#post-times-user-engagement) | Returns the total of users that reached a certain second of the video entire duration |
| `POST` | [`/times/user_engagement_by_day`](#post-times-user-engagement-by-day) | Returns an array with the engagement rate per day |
| `POST` | [`/times/user_engagement_by_field`](#post-times-user-engagement-by-field) | Returns an array with the engagement grouped by a field |
| `POST` | [`/times/user_engagement_by_traffic_origin`](#post-times-user-engagement-by-traffic-origin) | Returns an array with the engagement grouped by a field |
| `POST` | [`/traffic_origin/stats`](#post-traffic-origin-stats) | Returns statistics grouped by a specified field |
| `POST` | [`/traffic_origin/stats_by_day`](#post-traffic-origin-stats-by-day) | Returns statistics grouped by a specified field and day |
| `POST` | [`/traffic_origin/valid_utms`](#post-traffic-origin-valid-utms) | Counts the utms of the given player |
| `POST` | [`/turbo/stats_by_player`](#post-turbo-stats-by-player) | Statistics used by the turbo dashboard |

---

## `POST /clicks/total_by_company_day`

**Returns the totals of clicks for each day in a company and player**

Returns a list with the company clicks grouped by day in a given period.

`operationId`: `totalClicksByCompanyDay`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- **events_by_day** `EventByDay[]`
  - `array` de:
    - **day** `string` · formato: `date`
    - **total** `integer`
    - **total_uniq_device** `integer`
    - **total_uniq_session** `integer`
- **total_events** `integer`
- **total_uniq_device_events** `integer`
- **total_uniq_session_events** `integer`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /clicks/total_by_company_timed`

**Returns the total of user clicks at a time in seconds related to the video**

Returns an object containing the all the clicks grouped by the time in seconds it happened related to the video.

`operationId`: `totalByCompanyTimed`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **timed** `integer` — The second of the video that the user reached
  - **total_users** `integer` — The total of users that reached the timed

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /comparison_groups/list`

**List the AB tests (comparison groups) registered for the authenticated company**

Returns every AB test registered for the company, with the players enrolled in each test (including their traffic percentages) and the test start/finish timestamps. Results are ordered by creation date (newest first). Use the optional `start_date`/`end_date` filters to narrow results by the comparison group `created_at`.

`operationId`: `listComparisonGroups`

### Request body (`application/json`)

- **start_date** `string` — Lower bound applied to the comparison group `created_at`. Format `YYYY-MM-DD HH:MM:SS`. Optional. · formato: `date-time`
- **end_date** `string` — Upper bound applied to the comparison group `created_at`. Format `YYYY-MM-DD HH:MM:SS`. Optional — when omitted, no upper bound is applied. · formato: `date-time`
- **timezone** `string` — Timezone used to interpret `start_date`/`end_date`. Defaults to `Etc/UTC`.

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **id** `string` — The comparison group id.
  - **name** `string` — The name of the comparison group.
  - **player_ids** `string[]` — All player ids enrolled in this comparison group.
    - `array` de:
  - **players** `object[]` — Per-player traffic distribution for this comparison group.
    - `array` de:
      - **player_id** `string`
      - **traffic_percentage** `number` — The percentage of traffic routed to this player.
      - **started_at** `string` — The date/time when traffic started to route to this player. `null` if it hasn't started yet. · formato: `date-time`
      - **locked** `boolean` — Whether the player's traffic percentage is locked (won't be auto-adjusted).
  - **started_at** `string` — The date/time the comparison group test started. `null` if it hasn't started yet. · formato: `date-time`
  - **finished_at** `string` — The date/time the comparison group test finished. `null` if it is still running. · formato: `date-time`
  - **created_at** `string` — The date/time when the comparison group was created. · formato: `date-time`

**`400`** — Bad request: the request was malformed and some arguments were missing or invalid; see the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /comparison_groups/stats`

**Returns the full analytics metrics for up to 2 players of an AB test**

Returns, in a single response, the full set of analytics metrics for up to 2 players of an AB test: views, plays, finishes, clicks, conversions with revenue in USD/BRL/EUR, engagement, pitch audience and pitch retention, as well as the derived play rate, conversion rate and revenue per visitor (RPV). Each item's `start_date` is optional — when omitted, it falls back to the player's own `started_at` (from the comparison group's `players` list) and, if that is not set, to the comparison group's `started_at`. When `end_date` is omitted, results run through the current time.

`operationId`: `comparisonGroupsStats`

### Request body (`application/json`)

- **comparison_group_id** `string` _requerido_ — The AB test (comparison group) id.
- **items** `object[]` _requerido_ — Up to 2 players to return stats for. Players not enrolled in the AB test are silently ignored.
  - `array` de:
    - **player_id** `string` _requerido_ — The player id.
    - **start_date** `string` — Inclusive lower bound for the metrics of this player. Format `YYYY-MM-DD HH:MM:SS`. Optional — when omitted, falls back to the player's `started_at` on the comparison group, and finally to the comparison group's own `started_at`. · formato: `date-time`
    - **end_date** `string` — Inclusive upper bound for the metrics of this player. Format `YYYY-MM-DD HH:MM:SS`. Optional — when omitted, results run through the current time. · formato: `date-time`
- **events** `string[]` — Event names for the `views`/`plays`/`finishes` aggregates. Defaults to `["started", "viewed", "finished"]`.
  - `array` de:
- **timezone** `string` — Timezone used by ClickHouse to interpret every `start_date` / `end_date` string in this request (both caller-provided and the defaults resolved from the comparison group). Defaults to `Etc/UTC`.

### Respuestas

**`200`** — Successful operation

- **comparison_group** `object`
  - **id** `string`
  - **name** `string`
  - **player_ids** `string[]` — Every player id registered in the AB test, even when stats are requested for only a subset.
    - `array` de:
  - **started_at** `string` · formato: `date-time`
  - **finished_at** `string` · formato: `date-time`
- **stats** `object[]` — One entry per requested (and valid) player.
  - `array` de:
    - **player_id** `string`
    - **pitch_time** `integer` — Pitch time configured for the player, in seconds.
    - **video_duration** `integer` — Duration of the player's video, in seconds.
    - **views** `ComparisonGroupsEventTotals` — Event totals bucketed by total, unique sessions, and unique devices.
      - **total** `integer`
      - **total_uniq_sessions** `integer`
      - **total_uniq_device** `integer`
    - **plays** `ComparisonGroupsEventTotals` — Event totals bucketed by total, unique sessions, and unique devices.
      - **total** `integer`
      - **total_uniq_sessions** `integer`
      - **total_uniq_device** `integer`
    - **finishes** `ComparisonGroupsEventTotals` — Event totals bucketed by total, unique sessions, and unique devices.
      - **total** `integer`
      - **total_uniq_sessions** `integer`
      - **total_uniq_device** `integer`
    - **clicks** `ComparisonGroupsEventTotals` — Event totals bucketed by total, unique sessions, and unique devices.
      - **total** `integer`
      - **total_uniq_sessions** `integer`
      - **total_uniq_device** `integer`
    - **conversions** `object` — Conversion totals and revenue in USD, BRL and EUR (major currency units, e.g. `3740.0` = USD $3,740.00).
      - **total** `integer`
      - **total_uniq_sessions** `integer`
      - **total_uniq_device** `integer`
      - **total_amount_usd** `number` — Revenue in US dollars.
      - **total_amount_brl** `number` — Revenue in Brazilian reais.
      - **total_amount_eur** `number` — Revenue in euros.
    - **engagement** `object`
      - **average_watched_time** `number` — Average watched time in seconds.
      - **engagement_rate** `number` — Percentage of the video that was watched on average (`average_watched_time / video_duration * 100`).
      - **grouped_timed** `object[]` — User distribution across watched-time buckets used to derive retention metrics.
        - `array` de:
          - **timed** `integer` — Watched time in seconds.
          - **total_users** `integer` — Unique users that reached this watched time.
    - **pitch_audience** `integer` — Number of users that watched the video up to (or past) the configured pitch time.
    - **pitch_retention_rate** `number` — Percentage of users that reached the pitch time (`pitch_audience / total_users * 100`).
    - **play_rate** `number` — Percentage of viewers that started playing (`plays.total_uniq_device / views.total_uniq_device * 100`).
    - **conversion_rate** `number` — Percentage of unique plays that converted (`conversions.total_uniq_sessions / plays.total_uniq_device * 100`).
    - **rpv_usd** `number` — Revenue per unique play in USD (`conversions.total_amount_usd / plays.total_uniq_device`).
    - **rpv_brl** `number` — Revenue per unique play in BRL.
    - **rpv_eur** `number` — Revenue per unique play in EUR.

**`400`** — Bad request — malformed parameters or validation errors (e.g. too many items or a malformed `start_date`). The response body carries the details.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

**`404`** — The `comparison_group_id` does not belong to the authenticated company.

**`422`** — None of the items referenced a player enrolled in the comparison group.

---

## `POST /conversions/active_platforms`

**Returns the active platforms for a company**

Returns a list with the company active platforms.

`operationId`: `activePlatforms`

### Request body (`application/json`)

- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- `array` de:

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /conversions/stats_by_day`

**Returns the totals of conversions for each day in a company and player**

Returns a list with the company conversions grouped by day in a given period.

`operationId`: `statsByDay`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- **events_by_day** `EventByDay[]`
  - `array` de:
    - **day** `string` · formato: `date`
    - **total** `integer`
    - **total_uniq_device** `integer`
    - **total_uniq_session** `integer`
- **total_events** `integer`
- **total_uniq_device_events** `integer`
- **total_uniq_session_events** `integer`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /conversions/video_timed`

**Returns the conversions grouped by timed for a company and player**

Returns a list with the company conversions grouped by timed in a given period.

`operationId`: `videoTimed`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- **company_id** `string` · formato: `uuid`
- **player_id** `string`
- **grouped_timed** `ConversionsGroupedTimed[]`
  - `array` de:
    - **timed** `integer` — The second of the video that the user reached
    - **timed_conversions** `integer` — The number of conversions of the timed
    - **total_conversions** `integer` — The total of conversions that reached the timed

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /custom_metrics/list`

**List all custom metrics of a player**

Returns a list of all custom metrics of a player and the calculated engagement rate for them

`operationId`: `listCustomMetrics`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The player being analysed.
- **start_date** `string` — Start date of the period for event querying. · formato: `date-time`
- **end_date** `string` — End date of the period for event querying. · formato: `date-time`
- **timezone** `string` — The timezone to use for the date filtering, if not provided UTC will be used

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **id** `string` — The unique identifier of the custom metric
  - **name** `string` — The name of the custom metric
  - **time** `integer` — The time in seconds that the custom metric was set
  - **sequential_number** `integer` — The sequential number of the custom metric that ensures ordering
  - **engagement_rate** `number` — The engagement rate (%) of the custom metric
  - **total_users** `integer` — The total number of users that watched the video
  - **users_above** `integer` — The number of users that watched the video above the pitch time

**`400`** — If a 400 error occurs, it means parameters were incorrectly passed, and the response body will contain an explanation.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /events/leaderboard`

**Returns player leaderboards based on video engagement metrics**

Provides leaderboard rankings of players based on their video engagement metrics (views, plays, pauses, etc...) within specified time periods. Multiple leaderboards with different player limits can be requested in a single call.

`operationId`: `eventsLeaderboard`

### Request body (`application/json`)

- **company_id** `string` _requerido_ — The ID of the company to search for
- **leaderboards** `object[]` _requerido_
  - `array` de:
    - **leaderboard_limit** `integer` _requerido_ — Maximum number of players to include in the leaderboard
    - **start_date** `string` _requerido_ — Start date of the period for leaderboard data. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
    - **end_date** `string` — End date of the period for leaderboard data. This will be used as <=. If not provided, will include data up to the current date. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
    - **event** `string` — Event type to be used in the leaderboard ranking · valores: `started`, `finished`, `viewed`, `clicked`, `paused`
- **timezone** `string` — The timezone to use for date calculations (defaults to 'Etc/UCT' if not provided)

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **leaderboard_name** `string` — Name of the leaderboard (includes the limit)
  - **event** `string` — Event type that was used to rank the leaderboard
  - **leaderboards** `object[]`
    - `array` de:
      - **player_id** `string` — Unique identifier for the player
      - **total_plays** `integer` — Total number of video plays for this player
      - **uniq_plays** `integer` — Number of unique plays (by session) for this player
      - **uniq_device_plays** `integer` — Number of unique device plays for this player

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized

---

## `POST /events/total_by_company`

**Returns the number of times the events happened as well as the count considering unique device and sessions**

Returns a list with the companies and events with the number of times the event happened in a given period.

`operationId`: `totalEventsByCompanies`

### Request body (`application/json`)

- **events** `string[]` _requerido_ — Names of the events to filter by. Can be ['started', 'finished', 'viewed']
  - `array` de:
- **player_id** `string` — The ID of the player to filter the results by.
- **start_date** `string` — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **event** `string`
  - **total** `integer`
  - **total_uniq_sessions** `integer`
  - **total_uniq_device** `integer`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /events/total_by_company_day`

**Returns the totals of the events for each day in a company**

Returns a list with the companies grouped by day and the number of times each event happened for each day in a given period.

`operationId`: `totalEventsByCompanyDay`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **events** `string[]` _requerido_ — Names of the events to filter by. Can be ['started', 'finished', 'viewed']
  - `array` de:
- **start_date** `string` — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- **company_id** `string` · formato: `uuid`
- **player_id** `string`
- **started** `EventGroup`
  - **events_by_day** `EventByDay[]`
    - `array` de:
      - **day** `string` · formato: `date`
      - **total** `integer`
      - **total_uniq_device** `integer`
      - **total_uniq_session** `integer`
  - **total_events** `integer`
  - **total_uniq_device_events** `integer`
  - **total_uniq_session_events** `integer`
- **viewed** `EventGroup`
  - **events_by_day** `EventByDay[]`
    - `array` de:
      - **day** `string` · formato: `date`
      - **total** `integer`
      - **total_uniq_device** `integer`
      - **total_uniq_session** `integer`
  - **total_events** `integer`
  - **total_uniq_device_events** `integer`
  - **total_uniq_session_events** `integer`
- **finished** `EventGroup`
  - **events_by_day** `EventByDay[]`
    - `array` de:
      - **day** `string` · formato: `date`
      - **total** `integer`
      - **total_uniq_device** `integer`
      - **total_uniq_session** `integer`
  - **total_events** `integer`
  - **total_uniq_device_events** `integer`
  - **total_uniq_session_events** `integer`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /events/total_by_company_players`

**Returns the totals of the events for each player in a company**

Returns a list with the companies grouped by its players and the number of times each event happened for each one in a given period.

`operationId`: `totalEventsByCompaniesPlayers`

### Request body (`application/json`)

- **events** `string[]` _requerido_ — Names of the events to filter by. Can be ['started', 'finished', 'viewed']
  - `array` de:
- **start_date** `string` — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **players_start_date** `object[]`
  - `array` de:
    - **player_id** `string` — The ID of the player
    - **start_date** `string` — The start date for the player like "2024-01-01" · formato: `date`
    - **end_date** `string` — The end date to filter for the player like "2024-01-01, if none is passed this defaults to tomorrow UTC" · formato: `date`

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **player_id** `string`
  - **event** `string`
  - **total** `integer`
  - **total_uniq_sessions** `integer`
  - **total_uniq_device** `integer`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /headlines/stats_by_player`

**Statistics used by the headlines dashboard**

Returns several statistics used by the headlines dashboard. Engagement, views and play rate are among these metrics

`operationId`: `HeadlinesStatsByPlayer`

### Request body (`application/json`)

- **start_date** `string` _requerido_ — Start date of the period for event querying. · formato: `date`
- **end_date** `string` — End date of the period for event querying. Optional — when omitted, the response is unbounded at the upper end. When provided, inclusive at the end of the minute (e.g. `23:59:59` captures the full minute). · formato: `date`
- **player_id** `string` _requerido_ — The player being analysed.
- **video_duration** `integer` _requerido_ — The duration of the video
- **pitch_time** `integer` — The time in seconds that the video must be watched to be considered a pitch

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **engagement** `number` — The engagement rate of the users in percentage, its calculated by the average_watched_time / video_duration * 100
  - **number** `integer` — The headline number
  - **play_over_engagement** `number` — The play over engagement rate of the users in percentage, its calculated by the play_rate / engagement * 100
  - **play_rate** `number` — The play rate of the users in percentage, its calculated by the views / number * 100
  - **views** `integer` — The total of views
  - **pitch** `number` — Number of people that went above the pitch time
  - **clicks** `integer` — Number of clicks
  - **plays** `integer` — Number of plays
  - **conversions** `integer` — Number of conversions
  - **amount_brl** `integer` — Number of conversions in BRL
  - **amount_usd** `integer` — Number of conversions in USD
  - **amount_eur** `integer` — Number of conversions in EUR
  - **conversion_rate** `number` — The conversion rate of the headline

**`400`** — If a 400 error occurs, it means parameters were incorrectly passed, and the response body will contain an explanation.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `GET /players/list`

**List all players**

Returns a list of all players belonging to the authenticated user's company

`operationId`: `listPlayers`

### Parámetros

- **start_date** (`query`) `string` — Start date of the period for player filtering. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC"
- **end_date** (`query`) `string` — End date of the period for player filtering. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC"
- **timezone** (`query`) `string` — The timezone to use for the date filtering
- **name** (`query`) `string` — Filter players by name. Search is case-insensitive (including non-ASCII characters such as `É`/`é`). Special characters `%`, `_`, `\`, and brackets are matched literally — for example `name=[campaign_1]` returns only players whose names contain that exact tag. Surrounding whitespace is trimmed before matching; the trimmed value must be between 3 and 128 characters.
- **name_match** (`query`) `string` — How `name` is matched. `contains` (default) matches anywhere in the name; `starts_with` and `ends_with` anchor to the beginning or end; `exact` requires a full case-insensitive match. Sending `name_match` without `name` returns 400. · valores: `contains`, `starts_with`, `ends_with`, `exact`

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **id** `string` — The unique identifier of the player
  - **name** `string` — The name of the player
  - **pitch_time** `integer` — The pitch time configured for the player, if the player doesn't have a pitch time, the value is 0
  - **duration** `integer` — The duration of the video in seconds
  - **created_at** `string` — The date and time when the player was created · formato: `date-time`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `GET /quota/usage`

**Returns the live API quota usage for the authenticated company**

Returns the current usage and limits for your API key — one entry per quota window (typically a per-minute and a per-day bucket). Use this endpoint to self-rate-limit before issuing expensive analytics requests. Notes: - When a metric has no cap, the response returns `limit: null` and `remaining: null` so you don't divide by zero. - A single API request may count as more than one query against `max_queries_per_minute`, so the `queries` counter can climb faster than your request rate. The response includes `queries.note` to flag this when a hard limit applies. `read_bytes` reflects the actual data scanned and is the more reliable signal for sizing usage. - This endpoint itself counts as 1 query against `max_queries_per_minute`.

`operationId`: `quotaUsage`

### Respuestas

**`200`** — Successful operation

- **quotas** `object[]`
  - `array` de:
    - **interval_seconds** `integer` — Length of this quota window in seconds (e.g. 60 for per-minute, 86400 for per-day).
    - **interval_starts_at** `string` — ISO-8601 UTC timestamp marking the start of the current window. · formato: `date-time`
    - **interval_ends_at** `string` — ISO-8601 UTC timestamp marking when the current window resets. · formato: `date-time`
    - **queries** `QuotaMetric` — One metric within a quota window — used / limit / remaining.
      - **used** `integer` — Amount consumed within the current window.
      - **limit** `integer` — Hard cap for this metric in this window. `null` means no cap.
      - **remaining** `integer` — Budget left (`limit - used`, clamped at 0). `null` when `limit` is `null`.
      - **note** `string` — Optional explanatory note. Currently set on `queries` when a hard limit applies, to clarify that a single API request may count as more than one query against the limit.
    - **read_bytes** `QuotaMetric` — One metric within a quota window — used / limit / remaining.
      - **used** `integer` — Amount consumed within the current window.
      - **limit** `integer` — Hard cap for this metric in this window. `null` means no cap.
      - **remaining** `integer` — Budget left (`limit - used`, clamped at 0). `null` when `limit` is `null`.
      - **note** `string` — Optional explanatory note. Currently set on `queries` when a hard limit applies, to clarify that a single API request may count as more than one query against the limit.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

**`429`** — Quota exceeded. The body carries a stable `error` message, the upstream `code`, and (when parseable) a structured `details` object with the limit kind, remaining budget, and reset timestamp. Other endpoints under this API also use this shape when they hit `code: 201`.

- **error** `string` — Human-readable error message (stable text, safe to display).
- **code** `integer` — Upstream error code. `201` indicates quota exceeded.
- **details** `object` — Structured fields parsed from the upstream message. Omitted when parsing fails.
  - **limit_kind** `string` — Which metric caused the throttle (e.g. `queries`, `read_bytes`).
  - **used** `integer`
  - **limit** `integer`
  - **remaining** `integer`
  - **interval_seconds** `integer` — Length of the throttling window in seconds.
  - **resets_at** `string` — ISO-8601 UTC timestamp when the window rolls over and the budget resets. · formato: `date-time`

---

## `GET /sessions/live_users`

**Returns the number of live users for a player**

Returns the number of live users for a player that entered the website in the last X minutes. Disclaimer, this doesn't mean the user is still on the website, it means the user entered the website in the last X minutes.

`operationId`: `liveUsers`

### Parámetros

- **player_id** (`query`) `string` _requerido_ — The ID of the player to search for
- **minutes** (`query`) `integer` — The number of minutes to search for live users, defaults to 60 minutes

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **domain** `string` — The domain of the player
  - **live_users** `integer` — The number of live users for the player

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /sessions/stats`

**Returns statistics of all sessions of a player**

Returns statistics of sessions for a player given a date range

`operationId`: `sessionStats`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **video_duration** `integer` — The total duration of the video in seconds, if not provided we will use the duration of the video based on our database
- **timezone** `string` — The timezone to use for the date filtering
- **pitch_time** `integer` — The time in seconds that the video must be watched to be considered a pitch, if not provided we will use the pitch time of the video based on our database

### Respuestas

**`200`** — Successful operation

- **total_viewed** `integer`
- **total_viewed_device_uniq** `integer`
- **total_started** `integer`
- **total_started_session_uniq** `integer`
- **total_started_device_uniq** `integer`
- **total_finished** `integer`
- **total_finished_session_uniq** `integer`
- **total_finished_device_uniq** `integer`
- **engagement_rate** `number`
- **total_clicked** `integer`
- **total_clicked_device_uniq** `integer`
- **total_clicked_session_uniq** `integer`
- **total_viewed_session_uniq** `integer`
- **total_over_pitch** `integer`
- **total_under_pitch** `integer`
- **over_pitch_rate** `integer`
- **total_conversions** `integer`
- **overall_conversion_rate** `number`
- **total_amount_usd** `integer`
- **total_amount_brl** `integer`
- **total_amount_eur** `integer`
- **play_rate** `number`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /sessions/stats_by_day`

**Returns statistics of all sessions of a player by day**

Returns statistics of sessions for a player given a date range by day

`operationId`: `sessionStatsByDay`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **video_duration** `integer` — The total duration of the video in seconds, if not provided we will use the duration of the video based on our database
- **timezone** `string` — The timezone to use for the date filtering
- **pitch_time** `integer` — The time in seconds that the video must be watched to be considered a pitch, if not provided we will use the pitch time of the video based on our database

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **date_key** `string` · formato: `date`
  - **total_viewed** `integer`
  - **total_viewed_device_uniq** `integer`
  - **total_started** `integer`
  - **total_started_session_uniq** `integer`
  - **total_started_device_uniq** `integer`
  - **total_finished** `integer`
  - **total_finished_session_uniq** `integer`
  - **total_finished_device_uniq** `integer`
  - **engagement_rate** `number`
  - **total_clicked** `integer`
  - **total_clicked_device_uniq** `integer`
  - **total_clicked_session_uniq** `integer`
  - **total_viewed_session_uniq** `integer`
  - **total_over_pitch** `integer`
  - **total_under_pitch** `integer`
  - **over_pitch_rate** `integer`
  - **total_conversions** `integer`
  - **overall_conversion_rate** `number`
  - **total_amount_usd** `integer`
  - **total_amount_brl** `integer`
  - **total_amount_eur** `integer`
  - **play_rate** `number`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /sessions/stats_by_field`

**Returns statistics grouped by a specified field**

Returns statistics for sessions grouped by a specified field for a given company and player within a date range.

`operationId`: `statsByField`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **field** `string` _requerido_ — The field to group the statistics by
- **video_duration** `integer` _requerido_ — The total duration of the video in seconds
- **timezone** `string` — The timezone to use for the date filtering
- **pitch_time** `integer` — The time in seconds that the video must be watched to be considered a pitch

### Respuestas

**`200`** — Successful operation

- **company_id** `string` · formato: `uuid`
- **player_id** `string`
- **field** `string`
- **video_duration** `integer`
- **timezone** `string`
- **pitch_time** `integer`
- **total_viewed** `integer`
- **total_viewed_device_uniq** `integer`
- **total_started** `integer`
- **total_started_session_uniq** `integer`
- **total_started_device_uniq** `integer`
- **total_finished** `integer`
- **total_finished_session_uniq** `integer`
- **total_finished_device_uniq** `integer`
- **engagement_rate** `number`
- **total_clicked** `integer`
- **total_clicked_device_uniq** `integer`
- **total_clicked_session_uniq** `integer`
- **total_viewed_session_uniq** `integer`
- **grouped_field** `string`
- **total_over_pitch** `integer`
- **total_under_pitch** `integer`
- **over_pitch_rate** `integer`
- **total_conversions** `integer`
- **overall_conversion_rate** `number`
- **total_amount_usd** `integer`
- **total_amount_brl** `integer`
- **total_amount_eur** `integer`
- **play_rate** `number`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /sessions/stats_by_field_by_day`

**Returns statistics grouped by a specified field broke by day**

Returns statistics for sessions grouped by a specified field for a given company and player within a date range and broke by day.

`operationId`: `statsByFieldByDay`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **field** `string` _requerido_ — The field to group the statistics by
- **video_duration** `integer` _requerido_ — The total duration of the video in seconds
- **timezone** `string` — The timezone to use for the date filtering
- **pitch_time** `integer` — The time in seconds that the video must be watched to be considered a pitch

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **date_key** `string` · formato: `date`
  - **field** `string`
  - **video_duration** `integer`
  - **timezone** `string`
  - **pitch_time** `integer`
  - **total_viewed** `integer`
  - **total_viewed_device_uniq** `integer`
  - **total_started** `integer`
  - **total_started_session_uniq** `integer`
  - **total_started_device_uniq** `integer`
  - **total_finished** `integer`
  - **total_finished_session_uniq** `integer`
  - **total_finished_device_uniq** `integer`
  - **engagement_rate** `number`
  - **total_clicked** `integer`
  - **total_clicked_device_uniq** `integer`
  - **total_clicked_session_uniq** `integer`
  - **total_viewed_session_uniq** `integer`
  - **grouped_field** `string`
  - **total_over_pitch** `integer`
  - **total_under_pitch** `integer`
  - **over_pitch_rate** `integer`
  - **total_conversions** `integer`
  - **overall_conversion_rate** `number`
  - **total_amount_usd** `integer`
  - **total_amount_brl** `integer`
  - **total_amount_eur** `integer`
  - **play_rate** `number`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /times/user_engagement`

**Returns the total of users that reached a certain second of the video entire duration**

Returns an object containing the overall engagement of the users in a given period for the specified player.

`operationId`: `userEngagement`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **video_duration** `integer` _requerido_ — The total duration of the video in seconds
- **start_date** `string` — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" · formato: `date`
- **end_date** `string` — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- **average_watched_time** `integer` — The average time watched by the users in seconds
- **engagement_rate** `integer` — The engagement rate of the users in percentage, its calculated by the average_watched_time / video_duration * 100
- **grouped_timed** `GroupedTimed[]`
  - `array` de:
    - **timed** `integer` — The second of the video that the user reached
    - **total_users** `integer` — The total of users that reached the timed

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /times/user_engagement_by_day`

**Returns an array with the engagement rate per day**

Returns an array containing the overall engagement of the users in a given period for the specified player per day.

`operationId`: `userEngagementByDay`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **video_duration** `integer` _requerido_ — The total duration of the video in seconds
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **date** `string` — The date for the engagement rate
  - **engagement_rate** `integer` — The engagement rate for the day

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /times/user_engagement_by_field`

**Returns an array with the engagement grouped by a field**

Returns an array containing the overall engagement of the users in a given period for the specified player per day.

`operationId`: `userEngagementByField`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **field** `string` _requerido_ — The field to group the engagement by, possible values are 'country', 'browser', 'device_type', 'utm_campain', 'utm_source', 'utm_medium', 'utm_content', 'utm_term' If 'no_attribution' is passed, all values that have been set to null or that are empty strings will be returned.
- **values** `string[]` _requerido_ — The values to filter the field by, for example ['Brazil', 'Romenia'] or ['Chrome', 'Firefox']
  - `array` de:
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **group_key** `string` — The key for the group
  - **group_values** `GroupedTimed[]`
    - `array` de:
      - **timed** `integer` — The second of the video that the user reached
      - **total_users** `integer` — The total of users that reached the timed

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /times/user_engagement_by_traffic_origin`

**Returns an array with the engagement grouped by a field**

Returns an array containing the overall engagement of the users in a given period for the specified player per day.

`operationId`: `userEngagementByTrafficOrigin`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **query_key** `string` _requerido_ — The query param key to group the engagement by, possible values example: 'utm_campain', 'utm_source', 'utm_medium', 'utm_content', 'utm_term'
- **values** `string[]` _requerido_ — The values to filter the query key parameter by, for example ['Facebook', 'Google', 'Campaign 1', 'Campaign 2']
  - `array` de:
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **timezone** `string` — The timezone to use for the date filtering

### Respuestas

**`200`** — Successful operation

- **data** `GroupedEngagementRateByField[]`
  - `array` de:
    - **group_key** `string` — The key for the group
    - **group_values** `GroupedTimed[]`
      - `array` de:
        - **timed** `integer` — The second of the video that the user reached
        - **total_users** `integer` — The total of users that reached the timed

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /traffic_origin/stats`

**Returns statistics grouped by a specified field**

Returns statistics for traffic origin grouped by a specified query key for a given company and player within a date range.

`operationId`: `stats`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **query_key** `string` _requerido_ — The query key to group the statistics by
- **video_duration** `integer` _requerido_ — The total duration of the video in seconds
- **timezone** `string` — The timezone to use for the date filtering
- **pitch_time** `integer` — The time in seconds that the video must be watched to be considered a pitch

### Respuestas

**`200`** — Successful operation

- **company_id** `string` · formato: `uuid`
- **player_id** `string`
- **field** `string`
- **video_duration** `integer`
- **timezone** `string`
- **pitch_time** `integer`
- **total_viewed** `integer`
- **total_viewed_device_uniq** `integer`
- **total_started** `integer`
- **total_started_session_uniq** `integer`
- **total_started_device_uniq** `integer`
- **total_finished** `integer`
- **total_finished_session_uniq** `integer`
- **total_finished_device_uniq** `integer`
- **engagement_rate** `number`
- **total_clicked** `integer`
- **total_clicked_device_uniq** `integer`
- **total_clicked_session_uniq** `integer`
- **total_viewed_session_uniq** `integer`
- **grouped_field** `string`
- **total_over_pitch** `integer`
- **total_under_pitch** `integer`
- **over_pitch_rate** `integer`
- **total_conversions** `integer`
- **overall_conversion_rate** `number`
- **total_amount_usd** `integer`
- **total_amount_brl** `integer`
- **total_amount_eur** `integer`
- **play_rate** `number`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /traffic_origin/stats_by_day`

**Returns statistics grouped by a specified field and day**

Returns statistics for traffic origin grouped by a specified query key for a given company and player within a date range and grouped by day.

`operationId`: `statsByDay`

### Request body (`application/json`)

- **player_id** `string` _requerido_ — The ID of the player to search for
- **start_date** `string` _requerido_ — Start date of the period for event querying. This will be used as >=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **end_date** `string` _requerido_ — End date of the period for event querying. This will be used as <=. Format examples "2023-10-26T18:24:05.000+00:00" or "2023-10-26 18:24:05 UTC" or "2023-10-26" · formato: `date`
- **query_keys** `string[]` — The query keys to group the statistics by
  - `array` de:
- **video_duration** `integer` _requerido_ — The total duration of the video in seconds
- **timezone** `string` — The timezone to use for the date filtering
- **pitch_time** `integer` — The time in seconds that the video must be watched to be considered a pitch

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **date_key** `string` · formato: `date`
  - **query_key** `string`
  - **grouped_field** `string`
  - **total_viewed** `integer`
  - **total_viewed_session_uniq** `integer`
  - **total_viewed_device_uniq** `integer`
  - **total_started** `integer`
  - **total_started_session_uniq** `integer`
  - **total_started_device_uniq** `integer`
  - **total_finished** `integer`
  - **total_finished_session_uniq** `integer`
  - **total_finished_device_uniq** `integer`
  - **total_clicked** `integer`
  - **total_clicked_session_uniq** `integer`
  - **total_clicked_device_uniq** `integer`
  - **engagement_rate** `integer`
  - **total_over_pitch** `integer`
  - **total_under_pitch** `integer`
  - **over_pitch_rate** `number`
  - **total_conversions** `integer`
  - **overall_conversion_rate** `number`
  - **total_amount_usd** `integer`
  - **total_amount_brl** `integer`
  - **total_amount_eur** `integer`
  - **play_rate** `number`

**`400`** — Bad request: the request was bad formatted and some of the arguments were missing or wrong, look at the response body for more information.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /traffic_origin/valid_utms`

**Counts the utms of the given player**

Counts the utms of the given player. The values are src, sck, utm_source, utm_medium, utm_campaign, utm_term, utm_content, among any other valid query parameter

`operationId`: `ValidUtms`

### Request body (`application/json`)

- **start_date** `string` _requerido_ — Start date of the period for event querying. · formato: `date`
- **end_date** `string` — Start date of the period for event querying. · formato: `date`
- **player_id** `string` _requerido_ — The player being analysed.

### Respuestas

**`200`** — Successful operation

- **any_valid_query_key_param1** `integer`
- **any_valid_query_key_param2** `integer`
- **any_valid_query_key_paramN** `integer`

**`400`** — If a 400 error occurs, it means parameters were incorrectly passed, and the response body will contain an explanation.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

---

## `POST /turbo/stats_by_player`

**Statistics used by the turbo dashboard**

Returns several statistics used by the turbo dashboard. Speed, engagement, views, pitch and clicks are among these metrics

`operationId`: `TurboStatsByPlayer`

### Request body (`application/json`)

- **start_date** `string` _requerido_ — Start date of the period for event querying. · formato: `date`
- **end_date** `string` — End date of the period for event querying. Optional — when omitted, the response is unbounded at the upper end. When provided, inclusive at the end of the minute (e.g. `23:59:59` captures the full minute). · formato: `date`
- **player_id** `string` _requerido_ — The player being analysed.
- **video_duration** `integer` _requerido_ — The duration of the video
- **pitch_time** `integer` _requerido_ — The time in seconds that the video must be watched to be considered a pitch

### Respuestas

**`200`** — Successful operation

- `array` de:
  - **engagement** `number` — The engagement rate of the users in percentage, its calculated by the average_watched_time / (video_duration * number_of_sessions)
  - **speed** `number` — The turbo speed
  - **views** `integer` — The total of views
  - **pitch** `number` — Percentage of people that went above the pitch time
  - **click** `number` — Percentage of people that clicked on buttons of the page

**`400`** — If a 400 error occurs, it means parameters were incorrectly passed, and the response body will contain an explanation.

**`401`** — Unauthorized, missing proper X-Api-Token or X-Api-Version

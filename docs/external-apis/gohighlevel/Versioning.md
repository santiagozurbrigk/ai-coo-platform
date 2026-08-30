---
title: "API Versioning"
source: "https://marketplace.gohighlevel.com/docs/Versioning"
seccion: "Versioning"
api_version: "v3"
capturado: "2026-08-30"
---

# API Versioning

The HighLevel Public API is versioned to ensure developers have a stable surface to build on while the platform continues to evolve. The version is specified per-request using the `Version` request header.

## Versioning Schemes

We have used two versioning schemes over time:

**Date-based versions** — Earlier versions of the API used a date string (e.g. `2021-07-28`) as the version identifier. You pass the exact date string in the `Version` header.

**Named versions (current and upcoming)** — Starting with `v3`, versions use a named identifier (e.g. `v3`, `v4`). These are also passed in the `Version` header the same way.

When a new version is released, the previous version enters a maintenance window — it continues to receive critical bug fixes and security patches but no new features. Once a version is retired, requests sent with that version header will no longer be accepted.

We recommend migrating to the latest supported version before its retirement date to avoid service disruption.

## Supported Versions

| Version | Release Date | Supported Until |
| --- | --- | --- |
| v3 | June 11, 2026 | TBD |
| 2023-02-21 | February 21, 2023 | TBD |
| 2021-07-28 | July 28, 2021 | TBD |
| 2021-04-15 | April 15, 2021 | TBD |
| legacy | January 01, 2021 | TBD |

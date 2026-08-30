---
title: "Watermarks"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/watermarks"
seccion: "Social Planner > Watermarks"
api_version: "v3"
capturado: "2026-08-30"
---

# Watermarks

Watermark templates and image-watermark preview endpoints for the Social Planner

- [Create a watermark template](https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-watermark-template) — Create a new reusable watermark template for a location. The template stores the watermark image URL, position, scale, opacity, padding, and the connected accounts it applies to.
- [List watermark templates](https://marketplace.gohighlevel.com/docs/ghl/social-planner/list-watermark-templates) — Retrieve a paginated list of watermark templates for a specific location. Each template exposes the connected accounts it applies to via `accountIds`. Use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/watermarks/get-account) endpoint to look up account IDs.
- [Get a watermark template by ID](https://marketplace.gohighlevel.com/docs/ghl/social-planner/get-watermark-template) — Retrieve the full details of a specific watermark template, including its image URL, position, scale, opacity, padding, template name, and the connected accounts it applies to (`accountIds`). Use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/watermarks/get-account) endpoint to look up account IDs.
- [Update a watermark template by ID](https://marketplace.gohighlevel.com/docs/ghl/social-planner/update-watermark-template) — Update the config on an existing watermark template — image URL, position, scale, opacity, padding, template name, or the connected accounts it applies to. Updating `accountIds` re-binds the template to a different set of accounts; use the [Get Accounts](https://marketplace.gohighlevel.com/docs/ghl/social-planner/watermarks/get-account) endpoint to look up account IDs.
- [Delete a watermark template by ID](https://marketplace.gohighlevel.com/docs/ghl/social-planner/delete-watermark-template) — Soft-delete a watermark template. The template is marked as deleted and no longer applies at post-publish time, but the record is preserved in the database. Any accounts previously bound via `accountIds` are released and become eligible for other templates.
- [Apply watermark to an image](https://marketplace.gohighlevel.com/docs/ghl/social-planner/apply-watermark-to-image) — Apply a watermark to an image using either a specific template ID or by resolving the template bound to a specific connected account.

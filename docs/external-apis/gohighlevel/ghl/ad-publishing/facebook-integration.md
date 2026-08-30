---
title: "Facebook Integration"
source: "https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/facebook-integration"
seccion: "Ad Manager > Facebook Integration"
api_version: "v3"
capturado: "2026-08-30"
---

# Facebook Integration

Documentation for Ad-publishing API

- [Get current Facebook user](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-current-user) — Retrieve the authenticated Facebook user profile for a location
- [Get Facebook pages](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-pages) — Retrieve Facebook pages for the connected account. Without `limit` the response is an array of pages (this array response will soon be deprecated — migrate to the paginated form). When `limit` is provided the response is a paginated `{ pages, paging }` envelope; pass `after` (from `paging.next`) to fetch the next batch.
- [Get Instagram accounts for page](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-instagram-accounts) — Retrieve Instagram accounts linked to a specific Facebook page
- [Get page lead forms](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-page-lead-forms) — Retrieve lead gen forms for a specific Facebook page (published + drafts), sorted newest-first by `createdTime`. By default each form is returned in full (including its `questions`) as a plain array; pass `projection` (comma-separated) to return only the requested fields — any value outside the known field set is rejected. Pass `limit` (max 100) for a `{ forms, paging }` envelope; use `after` (from `paging.next`) to fetch the next batch.
- [Create page lead form](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-create-page-lead-form) — Create a lead gen form. With `isDraft: true` the form is stored locally and returned as a draft; without it the form is published to Facebook and the Meta record is returned. The two responses share almost no fields. Publishing enforces at least one question and a complete `thankYouPage` (title, body, buttonText) where a draft save enforces neither. Pass `draftFormId` when publishing an existing draft to have it deleted afterwards — either the bare id or the `draft_`-prefixed form is accepted, and cleanup failures are logged rather than surfaced.
- [Get ad accounts](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-ad-accounts) — Retrieve Facebook ad accounts available for the connected user
- [Get ad account details](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-ad-account) — Retrieve details of a specific Facebook ad account
- [Delete ad account](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-delete-ad-account) — Remove a Facebook ad account connection from a location
- [Get conversation forms](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-conversation-forms) — Retrieve Facebook conversation lead forms for a location. Without `limit` the response is a plain array. When `limit` is provided (max 100) the response is a paginated `{ conversationForms, paging }` envelope; pass `after` (from `paging.next`) to fetch the next batch.
- [Create conversation form](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-create-conversation-form) — Create a Messenger conversation form. Note the created record is returned in its raw stored form rather than the shape the listing endpoint uses: the identifier comes back as `_id` instead of `id`, and the internal `__v` version key is included.
- [Create Facebook integration](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-create-integration) — Create a Facebook ad integration for a location with page and ad account
- [Get Facebook integration](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-integration) — Retrieve the Facebook ad integration details for a location
- [Delete Facebook integration](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-delete-integration) — Remove the Facebook ad integration from a location
- [Delete page connection](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-delete-page) — Remove a Facebook page connection from a location
- [Set default page](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-set-default-page) — Set the default Facebook page for a location
- [Get lead form by ID](https://marketplace.gohighlevel.com/docs/ghl/ad-publishing/fb-get-lead-form) — Retrieve a lead form by id. Pass `isDraft=true` to read an unpublished local draft instead, in which case `leadFormId` accepts either the bare id or the `draft_`-prefixed form the listing endpoint reports. The two branches return different shapes, and neither matches the shape the listing endpoint returns for the same form: the published branch carries the full Meta definition (context card, thank-you page, legal content) but no `status`, `createdTime`, or `pageId`, while the draft branch returns the stored document verbatim under `_id`.

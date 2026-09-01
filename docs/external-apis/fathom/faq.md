> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# FAQ

> Frequently asked questions about Fathom's API

## Basics

### I’m new to APIs. How do I get started?

See the [Quickstart](/quickstart).

### Should I use an API key or build an OAuth app?

Use an **API key** if you only need access to your own (or your team’s) meetings—for internal tools or personal automation. Use **OAuth** if you’re building an app that other Fathom users will install so they can connect their own accounts. Note: OAuth apps can’t use `include_summary`/`include_transcript` on `/meetings`—fetch those via the `/recordings` endpoints instead.

***

## Access & Permissions

### Does my plan include API access?

Yes. API access—keys and webhooks— are included on all plans. Generate a key in User Settings → API Access.

### What meetings can my API key access?

Meetings you recorded and meetings shared with you or your team. Not other users’ private, unshared meetings. Whatever a user can view in Fathom, their API key can access.

### Can I access all calls across my org? Do you offer org-level API keys?

API keys are per user, not per org, and there are no org-level keys. For org-wide access, grant one or more **Admins view access to all shared calls**; that Admin’s key can then read everything shared across teams. Private calls remain visible only to their host, so only the host’s key can access them.

### Do admin API keys grant access to other users’ private meetings?

No. Admin or not, your API key only accesses meetings you recorded or that are shared with you or your team (or, for Admins, shared calls you’ve been granted view access to). Private calls stay host-only.

### If I generated my key while on a team and later leave or downgrade, does it still work?

Yes. The key keeps working and doesn’t need to be regenerated—only your permissions (which meetings it can see) change.

### What happens to a user’s API key when they are deactivated?

The key stops working and will return **4xx** response.

### Can an admin disable another user’s API key?

No. Admins can’t directly revoke another user’s API key. A user’s key only stops working when that user is deactivated or removed from the team (see above).

### Why am I getting a 401 Unauthorized error?

Your auth is missing or invalid: wrong or revoked API key, expired OAuth token, or malformed header. Check that the key is valid in User Settings, the user is still active, and you’re sending `X-Api-Key` (or Bearer for OAuth) correctly.

***

## Querying

### Does the API support pagination? Is there a bulk endpoint?

Yes to pagination—responses include a `next_cursor`; pass it as the `cursor` query parameter for the next page (the SDKs handle this for you). There is no bulk endpoint; pagination is the way to retrieve large sets.

### How many results come back per request?

The default page size is 10 meetings. There is no parameter to raise it—use `next_cursor` to page through more.

### Can I filter meetings by meeting type?

Yes. Pass `meeting_type` on `GET /meetings`, and use `GET /meeting_types` to discover valid names.

### Can I query meetings by attendee?

Not yet. Today you can filter by the attendee’s company domain via `calendar_invitees_domains[]`, and by `recorded_by[]` or `teams[]`.

### Can I look up a recording using a Fathom call URL?

No. The ID in a call URL (e.g. `/calls/610313346`) is the `url`, not the `recording_id` used by the API. They are different identifiers and aren’t interchangeable. To find a recording, query the [list meetings endpoint](/api-reference/meetings/list-meetings) with the available filters (e.g. `created_after`/`created_before`, `recorded_by[]`, `teams[]`, `calendar_invitees_domains[]`, `meeting_type`); each returned meeting includes its `recording_id`.

***

## Summaries

### What summary template is returned by the API?

Your account’s **default** summary template. The response has `template_name` (e.g. `"general"`) and `markdown_formatted` with the summary text.

### Can I change which summary type is returned?

No. The API returns your default template; changing a call’s template in the UI won’t change what the API returns.

### Can I request multiple summaries for a call?

No. One summary per recording.

### Can I get a plaintext (non-Markdown) summary?

No. Summaries from both the API and webhooks are Markdown-formatted only.

***

## Recordings & Downloads

### Can I download video or audio recordings via the API?

Yes. Call `POST /recordings/{recording_id}/download` to start generating a downloadable file, then poll [Get download status](/api-reference/recordings/get-download-status) (or pass a `destination_url` to have Fathom POST the result to you). The response returns a short-lived signed URL that expires \~24 hours after generation—request a new download when it expires. Downloading needs more than view access: limited-access shares receive **403 Forbidden**.

***

## Webhooks

### How do I set up and test a webhook?

Create one in User Settings → API Access → Manage → Add Webhook (or via the API). To test, use **Send test payload** in the webhook settings to fire a sample event at your endpoint. Note that this will still show "Test payload has been sent" if your endpoint responds with an error.

### Why isn’t my webhook firing?

Most often: **no post-call summary means no webhook.** Webhooks are tied to summary-email delivery, so short test calls without enough audio cues won’t fire. Also check: (1) the call generated a summary, (2) the call matches your trigger scope (private calls only fire `my_recordings`), (3) visibility was correct *at the moment the call finalized*—changing it afterward does not re-fire, (4) your endpoint returns 2xx quickly, and (5) no firewall/SSL issues.

### When are webhooks triggered, and how soon?

When new meeting content is ready—when a recording finalizes (the same event that triggers the summary email). One event per new meeting. Processing time varies, so we don’t publish a guaranteed delivery window.

### Do webhooks fire for impromptu calls?

Yes, as long as the call finalizes and generates a summary, and is owned by you or shared to a team.

### Are webhooks retried on non-2xx responses or timeouts?

Yes. Non-2xx responses or timeouts may trigger retries (the same event can be sent again). We don’t publish the retry schedule or attempt count.

### Can the same webhook event be delivered more than once?

Yes—but only via automatic retries; there’s no way to manually re-send a webhook after the fact. When an event is retried, the `webhook-id` header stays the same, so use it to deduplicate.

### Do you send additional webhooks if transcripts or summaries are updated later, or if visibility changes?

No. Webhooks fire once when content is first ready and won’t re-fire if content changes or the call’s visibility changes afterward. Poll the API if you need later updates.

### Can I add custom headers to outgoing webhook requests?

No. You can only set the destination URL, trigger scopes, and which data to include—there’s no option to add custom headers. Fathom sends its standard headers (including `webhook-id`, `webhook-timestamp`, and `webhook-signature` for verification).

### How do I verify a webhook actually came from Fathom?

Each request includes `webhook-id`, `webhook-timestamp`, and `webhook-signature` headers. Verify the HMAC-SHA256 signature using your webhook secret (the SDK’s `verify_webhook` helper does this for you). See [Webhooks](/webhooks) for the full method.

### Do webhook payloads include sharing or team-membership info?

The `shared_with` field indicates the team-level sharing scope - `no_teams`, `single_team`, `multiple_teams`, `all_teams`.

### Can I retrieve a webhook’s ID later to delete it?

No. A webhook’s ID is returned only when you create it and can’t be retrieved afterward via the API—and it isn’t included in delivered payloads. Since deleting a webhook via the API requires that ID, save it at creation; if you didn’t, delete the webhook from the UI (User Settings → API Access → Manage) instead. (This creation ID is separate from the per-delivery `webhook-id` header used for deduplication.)

### How can I identify which user account triggered a webhook?

The payload doesn’t identify which user’s API key the webhook is tied to. If you’re receiving webhooks for multiple users, route each user’s webhooks to a separate, user-specific destination URL rather than a shared endpoint.

***

## OAuth

### Can a single OAuth app register multiple redirect URIs?

Only multiple development redirect URIs are supported. For multiple production URIs, use separate OAuth apps.

### Is HTTPS required for redirect URIs?

Yes.

### How do refresh tokens work?

Refresh tokens are one-time-use and rotate on each refresh—using one returns a new access token and a new refresh token, and invalidates the old refresh token. If two workers refresh the same connection at once, one succeeds and the other gets an **HTTP 400**, so wrap refreshes in a lock if you run them concurrently.

### Can OAuth apps use `include_summary` / `include_transcript` on `/meetings`?

No. OAuth-connected apps must fetch summaries and transcripts via the `/recordings` endpoints instead.

***

## Rate Limits

### What are the API rate limits?

See [Rate Limiting](https://developers.fathom.ai/api-overview#rate-limiting)

### What happens if I exceed the rate limit?

You get **429** and should back off until the window resets.

### Are rate limits applied per API key or per organization?

Per account (per API key or OAuth token).

### Can you increase my rate limit?

We don’t offer standard or seat-based increases—the limits exist for stability. If they’re blocking a real workflow, share your use case and we can raise it with the Product team.

***

## Misc

### Is real-time or live transcript available via the API?

No. Transcripts are available only after post-call processing completes.

### I have a suggestion or feature request.

Reach out to **[help@fathom.video](mailto:help@fathom.video)** for integration and API feedback.

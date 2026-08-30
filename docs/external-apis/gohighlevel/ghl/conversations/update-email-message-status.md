---
title: "Update email message status"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/update-email-message-status"
seccion: "Conversations > Email > Update email message status"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/conversations/messages/email/:emailMessageId/status"
---

# Update email message status

```http
PUT /conversations/messages/email/:emailMessageId/status
```

Update delivery events, per-recipient statuses, and the overall message status for an email sent via a custom conversation provider.

### Authorization

- Requires the `conversations/message.write` OAuth scope.
- The calling OAuth app must own the conversation provider that originally sent the email.
- Attempts to update emails sent via LC Email or Mailgun will return `403 Forbidden`.

### Updatable Fields

All request body fields are optional. Pass only what you need to update.

**`events`** — Aggregate delivery event counters (integers). Counters are merged into the existing values (not replaced). Setting a counter to `0` is treated as no-op and will **not** reset the stored value.

**`recipients`** — Per-recipient delivery statuses. Each entry maps a recipient email address to a `MessageStatus` value. Use `failReason` to capture bounce or rejection details when the status is `failed`.

**`status`** — The overall message status. Accepts any `MessageStatus` enum value.

### Event Inference

The API automatically infers related events to maintain data consistency:

- **`clicked`, `complained`, `unsubscribed`, or `replied`** → implies `opened` (set to 1 if not already provided and open tracking is enabled) and `delivered` (set to 1).
- **`opened`** → implies `delivered` (set to 1 if not provided).
- **`delivered`, `permanent_fail`, or `temporary_fail`** → implies `accepted` (set to 1 if not provided).

### Timestamps

The API automatically records server-side timestamps on first occurrence for `delivered`, `opened`, and `clicked` events. Subsequent updates to these counters do not overwrite the original timestamp.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **emailMessageId** `string` _required_ — Email Message Id

### Request body (application/json)

**Body required**

- **events** `object` — Aggregate delivery event counters. Counters are merged into existing values. The API automatically infers related events (e.g., reporting `clicked` will also set `opened` and `delivered` if not already present). See the endpoint description for the full inference rules.
- **recipients** `object[]` — Per-recipient delivery statuses. Each entry maps a recipient email address to a delivery status. Entries are upserted — if a recipient already has a status, it will be overwritten with the new value.
- **status** `string` _required_ — The overall status of the email message. Required on every request. For emails with multiple recipients, consider using the `recipients` array for granular tracking and this field for the aggregate status.
  - Available options: `pending`, `scheduled`, `sent`, `delivered`, `read`, `undelivered`, `connected`, `failed`, `opened`, `clicked`

```json
{
  "events": {
    "delivered": 1,
    "opened": 1
  },
  "recipients": [
    {
      "emailId": "[email protected]",
      "status": "delivered"
    }
  ],
  "status": "delivered"
}
```

### Response (200 · application/json)

Email message status updated successfully

**Schema**

- **success** `boolean` _required_ — Whether the status update was persisted successfully.
- **message** `string` _required_ — Human-readable result message.

```json
{
  "success": true,
  "message": "Updated email message successfully"
}
```

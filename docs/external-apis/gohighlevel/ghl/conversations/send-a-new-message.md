---
title: "Send a new message"
source: "https://marketplace.gohighlevel.com/docs/ghl/conversations/send-a-new-message"
seccion: "Conversations > Messages > Send a new message"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/conversations/messages"
---

# Send a new message

```http
POST /conversations/messages
```

Post the necessary fields for the API to send a new message.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **type** `string` _required_ — Type of message being sent
  - Available options: `SMS`, `Email`, `WhatsApp`, `IG`, `FB`, `Custom`, `Live_Chat`, `InternalComment`
- **contactId** `string` _required_ — ID of the contact receiving the message
- **appointmentId** `string` — ID of the associated appointment
- **attachments** `string[]` — Array of attachment URLs
- **emailFrom** `string` — Email address to send from
- **emailCc** `string[]` — Array of CC email addresses
- **emailBcc** `string[]` — Array of BCC email addresses
- **html** `string` — HTML content of the message
- **message** `string` — Text content of the message. For InternalComment type, use `@username<userId>actualUserId</userId>` format to mention team members. The mentioned user IDs must also be included in the mentions array.
- **subject** `string` — Subject line for email messages
- **replyMessageId** `string` — ID of message being replied to
- **templateId** `string` — ID of message template
- **threadId** `string` — ID of message thread. For email messages, this is the message ID that contains multiple email messages in the thread
- **scheduledTimestamp** `number` — UTC Timestamp (in seconds) at which the message should be scheduled
- **conversationProviderId** `string` — ID of conversation provider
- **emailTo** `string` — Email address to send to, if different from contact's primary email. This should be a valid email address associated with the contact.
- **emailReplyMode** `string` — Mode for email replies
  - Available options: `reply`, `reply_all`
- **fromNumber** `string` — Phone number used as the sender number for outbound messages
- **toNumber** `string` — Recipient phone number for outbound messages
- **status** `string` _required_ — Message status
  - Available options: `delivered`, `failed`, `pending`, `read`
- **mentions** `string[]` — Array of user IDs mentioned in the message. Required for InternalComment type. User IDs correspond to team members tagged with `@username<userId>id</userId>` format in the message text.
- **userId** `string` — Use this field to specify the user who is making the internal comment when type is 'InternalComment'. If not provided, the comment will be attributed to the system or default user.

```json
{
  "type": "Email",
  "contactId": "abc123def456",
  "appointmentId": "appt123",
  "attachments": [
    "https://storage.com/file1.pdf",
    "https://storage.com/file2.jpg"
  ],
  "emailFrom": "[email protected]",
  "emailCc": [
    "[email protected]",
    "[email protected]"
  ],
  "emailBcc": [
    "[email protected]",
    "[email protected]"
  ],
  "html": "<p>Hello World</p>",
  "message": "Hello, how can I help you today?",
  "subject": "Important Update",
  "replyMessageId": "msg123",
  "templateId": "template123",
  "threadId": "thread123",
  "scheduledTimestamp": 1669287863,
  "conversationProviderId": "provider123",
  "emailTo": "[email protected]",
  "emailReplyMode": "reply_all",
  "fromNumber": "+1499499299",
  "toNumber": "+1439499299",
  "status": "delivered",
  "mentions": [
    "userId123",
    "userId456"
  ],
  "userId": "user123"
}
```

### Response (200 · application/json)

Created the message

**Schema**

- **conversationId** `string` _required_ — Conversation ID.
- **emailMessageId** `string` — This contains the email message id (only for Email type). Use this ID to send inbound replies to CRM to create a threaded email.
- **messageId** `string` _required_ — This is the main Message ID
- **messageIds** `string[]` — When sending via the GMB channel, we will be returning list of `messageIds` instead of single `messageId`.
- **msg** `string` — Additional response message when sending a workflow message

```json
{
  "conversationId": "ABC12h2F6uBrIkfXYazb",
  "emailMessageId": "rnGyqh2F6uBrIkfhFo9A",
  "messageId": "t22c6DQcTDf3MjRhwf77",
  "messageIds": [
    "string"
  ],
  "msg": "Message queued successfully."
}
```

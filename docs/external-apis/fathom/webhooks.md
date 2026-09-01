> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Webhooks

> Automatically trigger webhook events after your meetings

## About Webhooks in Fathom

Webhooks will send your meeting data (optionally including the summary, transcript, and action items) to a URL of your choice.

<Note>Webhooks can be set to fire after your own meetings and/or meetings that have been shared with you. Configure these triggers in your [Settings](https://fathom.video/customize#api-access-header), or when generating a webhook [via API](/api-reference/webhooks/create-a-webhook#body-triggered-for). </Note>

## Create a webhook

There are two ways to create a webhook:

#### Option 1 - in Settings

Webhooks can be configured in the [**API Access**](https://fathom.video/customize#api-access-header) section of your **User Settings**.

<Card title="How to create a webhook in Settings:" icon="link" href="https://fathom.video/customize#api-access-header" arrow="true" cta="Go to Settings">
  * Generate an API key, then go to **Manage** > **Add Webhook**
  * Enter a Destination URL
  * Select which new recordings should trigger webhooks
  * Select what data to include in the payload
</Card>

#### Option 2 - via API

You also have the option of creating and deleting webhooks with an API call.

[API docs: Create a webhook](/api-reference/webhooks/create-a-webhook).

<Info>Be sure the check the response body to confirm the webhook was created as expected. Webhooks created via API will also appear in your Settings. </Info>

## Test Your Webhook

To ensure your webhook is working as expected, you can record a brief, 2-minute meeting. Shortly after the meeting ends, your Destination URL should receive a webhook event.

For details on the webhook's payload, see our [API docs](/api-reference/webhook-payloads/new-meeting-content-ready).

<Tip>**Coming soon:** send a test payload from your Settings page</Tip>

## Verifying Webhooks

Webhook verification helps ensure that incoming requests to your endpoint are from Fathom and haven’t been altered.

Each webhook request sent from Fathom includes a signature in the request headers, which you can use to confirm the authenticity of the payload.

<Danger>To test webhooks locally or during development, you can skip verification—but don’t forget to add it back in before going live.</Danger>

### How to verify a webhook

#### Method 1 - SDK

If you're [using our SDK](/sdk), you can use the `verify_webhook` helper. Simply call:

<CodeGroup>
  ```javascript Typescript theme={null}
  Fathom.verifyWebhook(webhook_secret, request.headers, request.body)
  ```

  ```python Python theme={null}
  Fathom.verify_webhook(webhook_secret, request.headers, request.body)
  ```
</CodeGroup>

`webhook_secret` – Provided when you create the webhook (either in Settings or via the API).

`request.headers` – The HTTP headers from the incoming request, which include the signature Fathom sends.

`request.body` – The raw string body of the POST request.

#### Method 2 - Without the SDK

You can also verify incoming webhooks yourself using basic tools available in most programming languages.

Every webhook payload from Fathom includes three headers used for verification:

* `webhook-id` – The unique message identifier for the webhook message
* `webhook-timestamp` – Timestamp in seconds since epoch
* `webhook-signature` – The Base64 encoded list of signatures (space delimited), each prefixed with a version identifier

To verify the request:

1. Extract the `webhook-id`, `webhook-timestamp`, and `webhook-signature` from the request headers
2. Construct the signed content by concatenating the id, timestamp, and raw body, separated by periods: `${id}.${timestamp}.${body}` (be sure to use the **raw** body, before any JSON parsing)
3. Base64 decode the portion of your `webhook_secret` after the `whsec_` prefix (e.g., if your secret is `whsec_5WbX5kEWLlfzsGNjH64I8lOOqUB6e8FH`, use `5WbX5kEWLlfzsGNjH64I8lOOqUB6e8FH`)
4. Use the decoded secret to HMAC the signed content with SHA-256, then Base64-encode the result
5. Extract all signatures from the `webhook-signature` header (remove version prefixes like `v1,` before comparing)
6. Compare your calculated signature to each provided signature using a constant-time comparison method
7. Verify the timestamp is within your acceptable tolerance (typically 5 minutes) to prevent replay attacks
8. If any signature matches and the timestamp is valid, the webhook is authentic

Example:

<CodeGroup>
  ```javascript TypeScript theme={null}
  const crypto = require('crypto')

  function verifyWebhook(secret, headers, rawBody) {
    const webhookId = headers['webhook-id']
    const webhookTimestamp = headers['webhook-timestamp']
    const webhookSignature = headers['webhook-signature']

    // Verify timestamp (within 5 minutes)
    const timestamp = parseInt(webhookTimestamp, 10)
    const currentTimestamp = Math.floor(Date.now() / 1000)
    if (Math.abs(currentTimestamp - timestamp) > 300) {
      return false
    }

    // Construct signed content
    const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`

    // Base64 decode the secret (part after whsec_)
    const secretBytes = Buffer.from(secret.split('_')[1], 'base64')

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64')

    // Extract signatures from header (remove version prefixes)
    const signatures = webhookSignature.split(' ').map(sig => {
      const parts = sig.split(',')
      return parts.length > 1 ? parts[1] : parts[0]
    })

    // Constant-time comparison
    return signatures.some(sig =>
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(sig)
      )
    )
  }
  ```

  ```python Python theme={null}
  import hmac
  import hashlib
  import base64
  import time

  def verify_webhook(secret, headers, raw_body):
      webhook_id = headers.get('webhook-id')
      webhook_timestamp = headers.get('webhook-timestamp')
      webhook_signature = headers.get('webhook-signature')

      # Verify timestamp (within 5 minutes)
      timestamp = int(webhook_timestamp)
      current_timestamp = int(time.time())
      if abs(current_timestamp - timestamp) > 300:
          return False

      # Construct signed content
      signed_content = f"{webhook_id}.{webhook_timestamp}.{raw_body}"

      # Base64 decode the secret (part after whsec_)
      secret_bytes = base64.b64decode(secret.split('_')[1])

      # Calculate expected signature
      expected_signature = base64.b64encode(
          hmac.new(secret_bytes, signed_content.encode(), hashlib.sha256).digest()
      ).decode()

      # Extract signatures from header (remove version prefixes)
      signatures = []
      for sig in webhook_signature.split(' '):
          parts = sig.split(',')
          signatures.append(parts[1] if len(parts) > 1 else parts[0])

      # Constant-time comparison
      return any(
          hmac.compare_digest(expected_signature, sig) for sig in signatures
      )
  ```
</CodeGroup>

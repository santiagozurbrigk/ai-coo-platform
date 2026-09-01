> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Quickstart

> Generate an API key and make your first call

## Generate an API Key

<Card title="Get your Fathom API Key" icon="link" href="https://fathom.video/customize#api-access-header" arrow="true" cta="User Settings">
  Head to the API Access section of your User Settings and generate an API key.
</Card>

<Tip>API keys are scoped to the user who creates them. Your key can only access meetings you've recorded or that have been shared with you or your Team. <br /><br />Admins can access all users' shared meetings by [configuring View permissions](https://help.fathom.video/en/articles/10783489#understanding_permissions). API keys *never* grant access to other users' private meetings.</Tip>

## List recent meetings

List the 10 most recent meetings recorded by you or shared to your team.

<CodeGroup>
  ```cURL cURL theme={null}
  curl https://api.fathom.ai/external/v1/meetings \
       -H "X-Api-Key: YOUR_API_KEY"
  ```

  ```Python Python theme={null}
  import requests
  # List meetings (GET /meetings)
  response = requests.get(
    "https://api.fathom.ai/external/v1/meetings",
    headers={
      "X-Api-Key": "YOUR_API_KEY"
    },
  )
  print(response.json())
  ```

  ```Typescript TypeScript theme={null}
  // List meetings (GET /meetings)
  const response = await fetch("https://api.fathom.ai/external/v1/meetings", {
    method: "GET",
    headers: {
      "X-Api-Key": "YOUR_API_KEY"
    },
  });
  const body = await response.json();
  console.log(body);

  ```
</CodeGroup>

<Note>Replace `YOUR_API_KEY` with the API key you generated above.</Note>

<Accordion title="Here's an example response">
  ```json Example response theme={null}
  {
  "items": [
  {
    "title": "Quarterly Business Review",
    "meeting_title": "QBR 2025 Q1",
    "meeting_type": "Quarterly Business Review",
    "url": "https://fathom.video/xyz123",
    "meeting_url": "https://us02web.zoom.us/j/123456789",
    "share_url": "https://fathom.video/share/xyz123",
    "created_at": "2025-03-01T17:01:30Z",
    "scheduled_start_time": "2025-03-01T16:00:00Z",
    "scheduled_end_time": "2025-03-01T17:00:00Z",
    "recording_start_time": "2025-03-01T16:01:12Z",
    "recording_end_time": "2025-03-01T17:00:55Z",
    "transcript_language": "en",
    "calendar_invitees": [
      {
        "is_external": false,
        "name": "Alice Johnson",
        "email": "alice.johnson@acme.com"
      }
    ],
    "recorded_by": {
      "name": "Alice Johnson",
      "email": "alice.johnson@acme.com",
      "team": "Marketing"
    },
    "transcript": [
      {
        "speaker": {
          "display_name": "Alice Johnson",
          "matched_calendar_invitee_email": "alice.johnson@acme.com"
        },
        "text": "Let's revisit the budget allocations.",
        "timestamp": "00:05:32"
      }
    ],
    "default_summary": {
      "template_name": "general",
      "markdown_formatted": "## Summary\nWe reviewed Q1 OKRs, identified budget risks, and agreed to revisit projections next month.\n"
    },
    "action_items": [
      {
        "description": "Email revised proposal to client",
        "user_generated": false,
        "completed": false,
        "recording_timestamp": "00:10:45",
        "recording_playback_url": "https://fathom.video/calls/xyz123?timestamp=645",
        "assignee": {
          "name": "Alice Johnson",
          "email": "alice.johnson@acme.com",
          "team": "Marketing"
        }
      }
    ],
    "crm_matches": {
      "contacts": [
        {
          "name": "Jane Smith",
          "email": "jane.smith@client.com",
          "record_url": "https://app.hubspot.com/contacts/123"
        }
      ],
      "companies": [
        {
          "name": "Acme Corp",
          "record_url": "https://app.hubspot.com/companies/456"
        }
      ],
      "deals": [
        {
          "name": "Q1 Renewal",
          "amount": 50000,
          "record_url": "https://app.hubspot.com/deals/789"
        }
      ],
      "error": "no CRM connected"
    }
  }
  ],
  "limit": 1,
  "next_cursor": "eyJwYWdlX251bSI6Mn0="
  }
  ```
</Accordion>

## Get next 10 meetings

Use the `next_cursor` from the previous response to get the next page of meetings.

<CodeGroup>
  ```cURL bash theme={null}
  curl https://api.fathom.ai/external/v1/meetings \
       -H "X-Api-Key: YOUR_API_KEY" \
       -d cursor=CURSOR_FROM_PREVIOUS_RESPONSE
  ```

  ```Python python theme={null}
  import requests
  cursor = "CURSOR_FROM_PREVIOUS_RESPONSE"
  response = requests.get(
    f"https://api.fathom.ai/external/v1/meetings?cursor={cursor}",
    headers={"X-Api-Key": "YOUR_API_KEY"}
  )
  ```

  ```Typescript TypeScript theme={null}
  const cursor = "CURSOR_FROM_PREVIOUS_RESPONSE";
  const response = await fetch(`https://api.fathom.ai/external/v1/meetings?cursor=${cursor}`, {
    headers: {"X-Api-Key": "YOUR_API_KEY"}
  });
  ```
</CodeGroup>

<Note>If you're using our [TypeScript or Python SDKs](/sdks), pagination is handled automatically - no need to manage cursors manually. See [SDK Pagination](/sdks/pagination) for examples.</Note>

## Find specific meetings and get their transcripts

Let's say you met with `john.doe@client.com` a couple times during August and want to pull those transcripts. Use filters to return just those meetings.

<CodeGroup>
  ```cURL cURL theme={null}
  curl https://api.fathom.ai/external/v1/meetings \
       -H "X-Api-Key: YOUR_API_KEY" \
       -d include_transcript=true \
       -d recorded_by[]=me@mydomain.com \
       -d created_after=2024-08-01T00:00:00Z \
       -d created_before=2024-09-01T00:00:00Z

  # include_transcript=true: get transcripts in the response
  # recorded_by[]=me@mydomain.com: meetings you recorded
  # created_after/before: August date range
  ```

  ```Python Python theme={null}
  import requests

  response = requests.get(
    "https://api.fathom.ai/external/v1/meetings",
    headers={"X-Api-Key": "YOUR_API_KEY"},
    params={
      "include_transcript": "true",  # get transcripts in the response
      "recorded_by[]": "me@mydomain.com",  # meetings you recorded
      "created_after": "2024-08-01T00:00:00Z",  # August 1st onward
      "created_before": "2024-09-01T00:00:00Z"  # before September 1st
    }
  )
  meetings = response.json()["items"]
  transcript = meetings[0]["transcript"]  # Get first meeting's transcript
  ```

  ```Typescript TypeScript theme={null}
  const params = new URLSearchParams({
    include_transcript: "true",  // get transcripts in the response
    "recorded_by[]": "me@mydomain.com",  // meetings you recorded
    created_after: "2024-08-01T00:00:00Z",  // August 1st onward
    created_before: "2024-09-01T00:00:00Z"  // before September 1st
  });
  const response = await fetch(`https://api.fathom.ai/external/v1/meetings?${params}`, {
    headers: {"X-Api-Key": "YOUR_API_KEY"}
  });
  const meetings = await response.json();
  const transcript = meetings.items[0].transcript;  // Get first meeting's transcript
  ```
</CodeGroup>

<Note>You can also fetch transcripts separately using the [/recordings/\{recording\_id}/transcript](/api-reference/recordings/get-transcript) endpoint. **OAuth apps** must use this approach since they can't use `include_transcript` or `include_summary`.</Note>

## Next steps

Now that you you've made your first API calls, time to go deeper:

<CardGroup cols={2}>
  <Card title="API documentation" icon="code" href="/api-overview">
    See all available endpoints and methods
  </Card>

  <Card title="Webhooks" icon="webhook" href="/webhooks">
    Set up a webhook
  </Card>

  <Card title="SDKs" icon="gear-code" href="/sdks">
    Use our Typescript or Python SDK
  </Card>

  <Card title="OAuth" icon="key" href="/oauth">
    Build a Fathom integration with OAuth
  </Card>
</CardGroup>

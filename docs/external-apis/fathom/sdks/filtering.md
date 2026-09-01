> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Filtering

> Filter data with the Fathom SDKs

## Filtering Data

Both TypeScript and Python SDKs provide powerful filtering capabilities for retrieving specific data from the Fathom API.

### Basic Filtering

Start with simple single filters:

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  const fathom = new Fathom({
    security: {
      apiKeyAuth: "YOUR_API_KEY"
    }
  });

  // Filter by team only
  const result = await fathom.listMeetings({
    teams: ["Sales"]
  });

  for await (const page of result) {
    console.log(page);
  }
  ```

  ```python Python theme={null}
  from fathom_python import models, Fathom

  with Fathom(
      security=models.Security(
          api_key_auth="YOUR_API_KEY",
      ),
  ) as fathom:
      # Filter by team only
      res = fathom.list_meetings(
          teams=["Sales"]
      )

      while res is not None:
          print(res)
          res = res.next()
  ```
</CodeGroup>

### Filter by Meeting Type

Pass the name of one of your team's meeting types. Use `listMeetingTypes()` / `list_meeting_types()` to discover the valid names — an unknown name returns an empty list.

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  const fathom = new Fathom({
    security: {
      apiKeyAuth: "YOUR_API_KEY"
    }
  });

  const result = await fathom.listMeetings({
    meetingType: "Quarterly Business Review"
  });

  for await (const page of result) {
    console.log(page);
  }
  ```

  ```python Python theme={null}
  from fathom_python import models, Fathom

  with Fathom(
      security=models.Security(
          api_key_auth="YOUR_API_KEY",
      ),
  ) as fathom:
      res = fathom.list_meetings(
          meeting_type="Quarterly Business Review"
      )

      while res is not None:
          print(res)
          res = res.next()
  ```
</CodeGroup>

### Include Transcript Data

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  const fathom = new Fathom({
    security: {
      apiKeyAuth: "YOUR_API_KEY"
    }
  });

  async function getMeetingsWithTranscripts() {
    const result = await fathom.listMeetings({
      includeTranscript: true
    });

    for await (const page of result) {
      for (const meeting of page.items || []) {
        console.log(`Meeting: ${meeting.title}`);
        if (meeting.transcript) {
          console.log(`Transcript: ${meeting.transcript}`);
        }
      }
    }
  }
  ```

  ```python Python theme={null}
  from fathom_python import Fathom, models

  with Fathom(
      security=models.Security(
          api_key_auth="YOUR_API_KEY",
      ),
  ) as fathom:
      # Get meetings with transcript data
      meetings_with_transcripts = fathom.list_meetings(
          include_transcript=True
      )

      while meetings_with_transcripts is not None:
          for meeting in meetings_with_transcripts.items:
              if meeting.transcript:
                  print(f"Meeting: {meeting.title}")
                  print(f"Transcript: {meeting.transcript}")
          meetings_with_transcripts = meetings_with_transcripts.next()
  ```
</CodeGroup>

### Combining Multiple Filters

Combine multiple filters for precise queries:

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  const fathom = new Fathom({
    security: {
      apiKeyAuth: "YOUR_API_KEY"
    }
  });

  async function getFilteredMeetings() {
    const result = await fathom.listMeetings({
      calendarInviteesDomains: [
        "acme.com",
        "client.com",
      ],
      recordedBy: [
        "ceo@acme.com",
        "pm@acme.com",
      ],
      teams: [
        "Sales",
        "Engineering",
      ],
      meetingType: "Quarterly Business Review",
      includeTranscript: true,
      includeCrmMatches: true
    });

    for await (const page of result) {
      for (const meeting of page.items || []) {
        console.log(`Meeting: ${meeting.title}`);
        console.log(`Recorded by: ${meeting.recordedBy?.name}`);
        if (meeting.crmMatches) {
          console.log(`CRM matches: ${meeting.crmMatches}`);
        }
      }
    }
  }
  ```

  ```python Python theme={null}
  from fathom_python import Fathom, models

  with Fathom(
      security=models.Security(
          api_key_auth="YOUR_API_KEY",
      ),
  ) as fathom:
      # Complex filtering with multiple criteria
      filtered_meetings = fathom.list_meetings(
          calendar_invitees_domains=[
              "acme.com",
              "client.com",
          ],
          recorded_by=[
              "ceo@acme.com",
              "pm@acme.com",
          ],
          teams=[
              "Sales",
              "Engineering",
          ],
          meeting_type="Quarterly Business Review",
          include_transcript=True,
          include_crm_matches=True
      )

      while filtered_meetings is not None:
          for meeting in filtered_meetings.items:
              print(f"Meeting: {meeting.title}")
              print(f"Recorded by: {meeting.recorded_by.name}")
              if meeting.crm_matches:
                  print(f"CRM matches: {meeting.crm_matches}")
          filtered_meetings = filtered_meetings.next()
  ```
</CodeGroup>

### TypeScript Type Safety

The TypeScript SDK provides full type safety for filter parameters:

```typescript theme={null}
import { Fathom } from 'fathom-typescript';

const fathom = new Fathom({
  security: {
    apiKeyAuth: "YOUR_API_KEY"
  }
});

// TypeScript will provide autocomplete and type checking
async function typedFiltering() {
  const result = await fathom.listMeetings({
    includeTranscript: true,
    includeCrmMatches: false
  });

  for await (const page of result) {
    // TypeScript knows the structure of the response
    console.log(`Page has ${page.items?.length || 0} meetings`);
  }
}
```

<Note>For complete parameter documentation including types, examples, and detailed descriptions, see the [API Reference](/api-reference/meetings/list-meetings).</Note>

> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Available Methods

> All available methods in the Fathom SDKs

## Available Methods

Both TypeScript and Python SDKs support all Fathom API operations.

### Core Methods

| TypeScript           | Python                 | Description                                 |
| -------------------- | ---------------------- | ------------------------------------------- |
| `listMeetings()`     | `list_meetings()`      | List meetings with filtering and pagination |
| `listMeetingTypes()` | `list_meeting_types()` | List your team's published meeting types    |
| `listTeams()`        | `list_teams()`         | List teams accessible to the user           |
| `listTeamMembers()`  | `list_team_members()`  | List members of a specific team             |
| `createWebhook()`    | `create_webhook()`     | Create webhook for real-time notifications  |
| `deleteWebhook()`    | `delete_webhook()`     | Delete an existing webhook                  |

### Quick Examples

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  const fathom = new Fathom({
    security: { apiKeyAuth: "YOUR_API_KEY" }
  });

  // List meetings with filtering
  const meetings = await fathom.listMeetings({
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
  });

  // List meeting types
  const meetingTypes = await fathom.listMeetingTypes({});

  // List teams
  const teams = await fathom.listTeams({});

  // Create webhook
  const webhook = await fathom.createWebhook({
    destinationUrl: "https://your-app.com/webhook",
    includeTranscript: true,
    includeCrmMatches: true
  });
  ```

  ```python Python theme={null}
  from fathom_python import models, Fathom

  with Fathom(security=models.Security(
      api_key_auth="YOUR_API_KEY"
  )) as fathom:
      # List meetings with filtering
      meetings = fathom.list_meetings(
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
          include_crm_matches=False,
          include_transcript=False
      )

      # List meeting types
      meeting_types = fathom.list_meeting_types()

      # List teams
      teams = fathom.list_teams()

      # Create webhook
      webhook = fathom.create_webhook(
          destination_url="https://your-app.com/webhook",
          include_transcript=True,
          include_crm_matches=True
      )
  ```
</CodeGroup>

<Note>For complete parameter documentation including types, examples, and detailed descriptions, see [API Reference](/api-reference/meetings/list-meetings).</Note>

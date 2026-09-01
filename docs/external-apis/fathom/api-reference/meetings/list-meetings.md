> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# List meetings



## OpenAPI

````yaml /api-reference/openapi.yaml get /meetings
openapi: 3.1.1
info:
  title: Fathom External API
  version: 1.0.0
  description: |
    The Fathom External API lets you poll meetings, teams, and team members, and
    optionally receive webhooks when content from a new meeting is ready.
servers:
  - url: https://api.fathom.ai/external/v1
security:
  - ApiKeyAuth: []
  - BearerAuth: []
paths:
  /meetings:
    get:
      tags:
        - Meetings
      summary: List meetings
      operationId: listMeetings
      parameters:
        - in: query
          name: calendar_invitees_domains[]
          description: >
            Domains of the companies to filter by. Exact match.


            Pass the parameter once per value, e.g.

            `calendar_invitees_domains[]=acme.com&calendar_invitees_domains[]=client.com`.


            Returns meetings whose associated company matches one of the
            specified domains. (Note that meetings are only associated with one
            company.)
          schema:
            type: array
            items:
              type: string
            example:
              - acme.com
              - client.com
          style: form
          explode: true
        - in: query
          name: calendar_invitees_domains_type
          description: >-
            Filter by whether calendar invitee list includes external email
            domains.
          schema:
            type: string
            enum:
              - all
              - only_internal
              - one_or_more_external
            default: all
        - in: query
          name: created_after
          description: >-
            Filter to meetings with created_at after this timestamp, e.g.
            `created_after=2025-01-01T00:00:00Z`.
          schema:
            type: string
        - in: query
          name: created_before
          description: >-
            Filter to meetings with created_at before this timestamp, e.g.
            `created_before=2025-01-01T00:00:00Z`.
          schema:
            type: string
        - in: query
          name: cursor
          description: Cursor for pagination.
          schema:
            type: string
        - in: query
          name: include_action_items
          description: Include the action items for each meeting.
          schema:
            type: boolean
            default: false
        - in: query
          name: include_crm_matches
          description: >-
            Include CRM matches for each meeting. Only returns data from your or
            your team's linked CRM.
          schema:
            type: boolean
            default: false
        - in: query
          name: include_highlights
          description: Include the highlights for each meeting.
          schema:
            type: boolean
            default: false
        - in: query
          name: include_summary
          description: >-
            Include the summary for each meeting. Unavailable for OAuth
            connected apps (use /recordings instead).
          schema:
            type: boolean
            default: false
        - in: query
          name: include_transcript
          description: >-
            Include the transcript for each meeting. Unavailable for OAuth
            connected apps (use /recordings instead).
          schema:
            type: boolean
            default: false
        - in: query
          name: meeting_type
          description: >
            Filter by meeting type name.


            Returns only meetings assigned the meeting type with this name. Use
            /meeting_types to discover valid values. An unknown or non-matching
            name returns an empty list.
          schema:
            type: string
            example: Quarterly Business Review
        - in: query
          name: recorded_by[]
          description: >
            Email addresses of users who recorded meetings.


            Pass the parameter once per value, e.g.

            `recorded_by[]=ceo@acme.com&recorded_by[]=pm@acme.com`.


            Returns meetings recorded by any of the specified users.


            If no value is passed (or with `teams[]`), calls from users external
            to your Org will not be returned.
          schema:
            type: array
            items:
              type: string
              format: email
            example:
              - ceo@acme.com
              - pm@acme.com
          style: form
          explode: true
        - in: query
          name: teams[]
          description: >
            Team names to filter by.


            Pass the parameter once per value, e.g.

            `teams[]=Sales&teams[]=Engineering`.


            Returns meetings that belong to any of the specified teams.


            If no value is passed (or with `recorded_by[]`), calls from users
            external to your Org will not be returned.
          schema:
            type: array
            items:
              type: string
            example:
              - Sales
              - Engineering
          style: form
          explode: true
      responses:
        '200':
          description: Paginated list of meetings.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MeetingListResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'
components:
  schemas:
    MeetingListResponse:
      type: object
      required:
        - limit
        - next_cursor
        - items
      properties:
        limit:
          type: integer
          nullable: true
          example: 1
        next_cursor:
          type: string
          nullable: true
          example: eyJwYWdlX251bSI6Mn0=
        items:
          type: array
          items:
            $ref: '#/components/schemas/Meeting'
    Meeting:
      type: object
      required:
        - title
        - meeting_title
        - meeting_type
        - recording_id
        - url
        - share_url
        - created_at
        - scheduled_start_time
        - scheduled_end_time
        - recording_start_time
        - recording_end_time
        - calendar_invitees_domains_type
        - shared_with
        - recorded_by
        - transcript_language
        - calendar_invitees
      properties:
        title:
          type: string
          example: Quarterly Business Review
        meeting_title:
          type: string
          example: QBR 2025 Q1
          description: Calendar event title.
          nullable: true
        meeting_type:
          type: string
          example: Quarterly Business Review
          description: >-
            The name of the meeting type assigned to this meeting, or `null` if
            none is assigned.
          nullable: true
        recording_id:
          type: integer
          example: 123456789
          description: The ID of the meeting recording.
        url:
          type: string
          format: uri
          example: https://fathom.video/xyz123
        meeting_url:
          type: string
          format: uri
          example: https://us02web.zoom.us/j/123456789
          description: >-
            The underlying meeting join URL (Zoom, Google Meet, Microsoft Teams,
            or Slack huddle) from the calendar event. `null` when there is no
            associated calendar meeting.
          nullable: true
        share_url:
          type: string
          format: uri
          example: https://fathom.video/share/xyz123
        created_at:
          type: string
          format: date-time
          example: '2025-03-01T17:01:30Z'
        scheduled_start_time:
          type: string
          format: date-time
          example: '2025-03-01T16:00:00Z'
        scheduled_end_time:
          type: string
          format: date-time
          example: '2025-03-01T17:00:00Z'
        recording_start_time:
          type: string
          format: date-time
          example: '2025-03-01T16:01:12Z'
        recording_end_time:
          type: string
          format: date-time
          example: '2025-03-01T17:00:55Z'
        calendar_invitees_domains_type:
          type: string
          enum:
            - only_internal
            - one_or_more_external
          example: one_or_more_external
        shared_with:
          type: string
          enum:
            - no_teams
            - single_team
            - multiple_teams
            - all_teams
          example: single_team
          description: >-
            Who the meeting is shared with within your organization. `no_teams`:
            private to the recorder. `single_team`: shared with one team.
            `multiple_teams`: shared with multiple teams. `all_teams`: shared
            with everyone in the organization.
        transcript_language:
          type: string
          example: en
        transcript:
          type: array
          items:
            $ref: '#/components/schemas/TranscriptItem'
          nullable: true
        default_summary:
          $ref: '#/components/schemas/MeetingSummary'
          nullable: true
        action_items:
          type: array
          items:
            $ref: '#/components/schemas/ActionItem'
          nullable: true
        highlights:
          type: array
          items:
            $ref: '#/components/schemas/Highlight'
          nullable: true
        calendar_invitees:
          type: array
          items:
            $ref: '#/components/schemas/Invitee'
        recorded_by:
          $ref: '#/components/schemas/FathomUser'
        crm_matches:
          $ref: '#/components/schemas/CRMMatches'
          nullable: true
    TranscriptItem:
      type: object
      required:
        - speaker
        - text
        - timestamp
      properties:
        speaker:
          $ref: '#/components/schemas/TranscriptItemSpeaker'
        text:
          type: string
          example: Let's revisit the budget allocations.
        timestamp:
          type: string
          pattern: ^\d{2}:\d{2}:\d{2}$
          description: Timestamp relative to the start of the meeting (HH:MM:SS).
          example: '00:05:32'
    MeetingSummary:
      type: object
      required:
        - template_name
        - markdown_formatted
      properties:
        template_name:
          type: string
          example: general
          nullable: true
        markdown_formatted:
          type: string
          example: >
            ## Summary

            We reviewed Q1 OKRs, identified budget risks, and agreed to revisit
            projections next month.
          description: Always displayed in English.
          nullable: true
    ActionItem:
      type: object
      required:
        - description
        - user_generated
        - completed
        - recording_timestamp
        - recording_playback_url
        - assignee
      properties:
        description:
          type: string
          example: Email revised proposal to client
          description: Always displayed in English.
        user_generated:
          type: boolean
          example: false
        completed:
          type: boolean
          example: false
        recording_timestamp:
          type: string
          pattern: ^\d{2}:\d{2}:\d{2}$
          description: Timestamp relative to the start of the recording (HH:MM:SS).
          example: '00:10:45'
        recording_playback_url:
          type: string
          format: uri
          example: https://fathom.video/calls/xyz123?timestamp=645
        assignee:
          $ref: '#/components/schemas/Assignee'
    Highlight:
      type: object
      required:
        - type
        - summary
        - start_time
        - end_time
      properties:
        type:
          type: string
          description: The label of the bookmark this highlight was created from.
          example: Objection
        summary:
          type: string
          description: A short summary of the highlighted moment.
          example: Pushed back on price
          nullable: true
        text:
          type: string
          description: >-
            The full text of the highlight. Only present when it differs from
            `summary`.
          example: They pushed back hard on the price
        start_time:
          type: number
          description: Start of the highlight, in seconds from the start of the recording.
          example: 16
        end_time:
          type: number
          description: End of the highlight, in seconds from the start of the recording.
          example: 27.5
    Invitee:
      type: object
      required:
        - name
        - email
        - email_domain
        - is_external
      properties:
        name:
          type: string
          example: Alice Johnson
          nullable: true
        matched_speaker_display_name:
          type: string
          description: >
            (When `include_transcript` is `true`) The display_name matching this
            email address. Null if no exact match found.


            Only available for meetings after Feb 1, 2025.
          example: Alice Johnson
          nullable: true
        email:
          type: string
          format: email
          example: alice.johnson@acme.com
          nullable: true
        email_domain:
          type: string
          example: acme.com
          nullable: true
        is_external:
          type: boolean
          example: false
    FathomUser:
      type: object
      required:
        - name
        - email
        - email_domain
        - team
      properties:
        name:
          type: string
          example: Alice Johnson
        email:
          type: string
          format: email
          example: alice.johnson@acme.com
        email_domain:
          type: string
          example: acme.com
        team:
          type: string
          example: Marketing
          nullable: true
    CRMMatches:
      type: object
      nullable: true
      description: >
        CRM data linked to the meeting. Only returns data from your or your
        team's linked CRM.

        If no CRM is connected for the workspace, the `error` field will be
        populated.
      properties:
        contacts:
          type: array
          items:
            $ref: '#/components/schemas/CRMContactMatch'
        companies:
          type: array
          items:
            $ref: '#/components/schemas/CRMCompanyMatch'
        deals:
          type: array
          items:
            $ref: '#/components/schemas/CRMDealMatch'
        error:
          type: string
          nullable: true
          example: no CRM connected
    TranscriptItemSpeaker:
      type: object
      required:
        - display_name
      properties:
        display_name:
          type: string
          example: Alice Johnson
        matched_calendar_invitee_email:
          type: string
          nullable: true
          description: >
            The email address of the calendar invitee matching this speaker.
            Null if no exact match found.
          format: email
          example: alice.johnson@acme.com
    Assignee:
      type: object
      required:
        - name
        - email
        - team
      properties:
        name:
          type: string
          example: Alice Johnson
          nullable: true
        email:
          type: string
          format: email
          example: alice.johnson@acme.com
          nullable: true
        team:
          type: string
          example: Marketing
          nullable: true
    CRMContactMatch:
      type: object
      required:
        - name
        - email
        - record_url
      properties:
        name:
          type: string
          example: Jane Smith
        email:
          type: string
          format: email
          example: jane.smith@client.com
        record_url:
          type: string
          format: uri
          example: https://app.hubspot.com/contacts/123
    CRMCompanyMatch:
      type: object
      required:
        - name
        - record_url
      properties:
        name:
          type: string
          example: Acme Corp
        record_url:
          type: string
          format: uri
          example: https://app.hubspot.com/companies/456
    CRMDealMatch:
      type: object
      required:
        - name
        - amount
        - record_url
      properties:
        name:
          type: string
          example: Q1 Renewal
        amount:
          type: number
          description: The amount in dollars.
          example: 50000
        record_url:
          type: string
          format: uri
          example: https://app.hubspot.com/deals/789
  responses:
    BadRequest:
      description: Bad request - the query parameters were invalid.
    Unauthorized:
      description: Unauthorized - missing or invalid `Authorization` header.
    RateLimited:
      description: >-
        Rate limited - you have exceeded the rate limit for the requested
        endpoint. Check our [rate limiting](/api-reference#rate-limiting)
        documentation for more information.
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Api-Key
      description: |
        Include your API key in the `X-Api-Key` header of every request.
    BearerAuth:
      type: http
      scheme: bearer

````
> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Create a webhook

> Create a webhook to receive new meeting content.
At least one of `include_transcript`, `include_crm_matches`, `include_summary`, or `include_action_items` must be true.




## OpenAPI

````yaml /api-reference/openapi.yaml post /webhooks
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
  /webhooks:
    post:
      tags:
        - Webhooks
      summary: Create a webhook
      description: >
        Create a webhook to receive new meeting content.

        At least one of `include_transcript`, `include_crm_matches`,
        `include_summary`, or `include_action_items` must be true.
      operationId: createWebhook
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - destination_url
                - triggered_for
              additionalProperties: false
              properties:
                destination_url:
                  type: string
                  description: The URL to send the webhook to.
                  format: uri
                  example: https://example.com/webhook
                include_action_items:
                  type: boolean
                  description: Include the action items for each meeting.
                  default: false
                  example: true
                include_crm_matches:
                  type: boolean
                  description: >-
                    Include CRM matches for each meeting. Only returns data from
                    your or your team's linked CRM.
                  default: false
                  example: true
                include_summary:
                  type: boolean
                  description: Include the summary for each meeting.
                  default: false
                  example: true
                include_transcript:
                  type: boolean
                  description: Include the transcript for each meeting.
                  default: false
                  example: true
                triggered_for:
                  type: array
                  example:
                    - my_recordings
                    - my_shared_with_team_recordings
                    - shared_external_recordings
                  description: >
                    You must send at least one of the following types of
                    recordings to trigger on.

                    - `my_recordings`: Your private recordings, as well as those
                    you've shared with individuals. (On Team Plans, this
                    excludes recordings you've shared with any teams.)

                    - `shared_external_recordings`: Recordings shared with you
                    by other users. (For Team Plans, this does not include
                    recordings shared by other users on your Team Plan.)

                    - `my_shared_with_team_recordings`: (Team Plans only). All
                    recordings that you have shared with other teams (e.g.
                    Marketing or Sales). Recordings you've shared with
                    individuals but not with teams are not included.

                    - `shared_team_recordings`: (Team Plans only) All recordings
                    you can access from other users on your Team Plan, whether
                    shared with you individually or with your team.
                  items:
                    type: string
                    enum:
                      - my_recordings
                      - shared_external_recordings
                      - my_shared_with_team_recordings
                      - shared_team_recordings
      responses:
        '201':
          description: The created webhook.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Webhook'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'
components:
  schemas:
    Webhook:
      type: object
      required:
        - id
        - url
        - secret
        - created_at
        - include_transcript
        - include_crm_matches
        - include_summary
        - include_action_items
        - triggered_for
      properties:
        id:
          type: string
          example: ikEoQ4bVoq4JYUmc
        url:
          type: string
          format: uri
          example: https://example.com/webhook
        secret:
          type: string
          description: The secret used to verify the webhook signature.
          example: whsec_x6EV6NIAAz3ldclszNJTwrow
        created_at:
          type: string
          description: The date and time the webhook was created in ISO 8601 format.
          format: date-time
          example: '2025-06-30T10:40:46Z'
        include_transcript:
          type: boolean
          example: true
        include_crm_matches:
          type: boolean
          example: true
        include_summary:
          type: boolean
          example: true
        include_action_items:
          type: boolean
          example: true
        triggered_for:
          type: array
          example:
            - my_recordings
            - my_shared_with_team_recordings
            - shared_external_recordings
          items:
            type: string
            enum:
              - my_recordings
              - shared_external_recordings
              - my_shared_with_team_recordings
              - shared_team_recordings
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
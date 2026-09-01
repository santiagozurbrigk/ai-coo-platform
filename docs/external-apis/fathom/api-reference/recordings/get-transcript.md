> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Get transcript

> This endpoint has two behaviors depending on your request payload:
- If you send `destination_url`, the endpoint will behave in an asynchronous manner.
- If you do not send `destination_url`, the endpoint will return the data directly.




## OpenAPI

````yaml /api-reference/openapi.yaml get /recordings/{recording_id}/transcript
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
  /recordings/{recording_id}/transcript:
    get:
      tags:
        - Recordings
      summary: Get transcript
      description: >
        This endpoint has two behaviors depending on your request payload:

        - If you send `destination_url`, the endpoint will behave in an
        asynchronous manner.

        - If you do not send `destination_url`, the endpoint will return the
        data directly.
      operationId: getRecordingTranscript
      parameters:
        - name: recording_id
          in: path
          required: true
          description: The ID of the meeting recording to fetch the transcript for.
          schema:
            type: integer
            example: 123456789
        - in: query
          name: destination_url
          description: >-
            Destination URL for where we'll POST the transcript. If not sent,
            this endpoint will return the data directly.
          required: false
          schema:
            type: string
            format: uri
            example: https://example.com/destination
      responses:
        '200':
          description: >-
            Either the destination URL for where we'll POST the transcript, or
            the transcript for the recording as an array.
          content:
            application/json:
              schema:
                anyOf:
                  - type: object
                    required:
                      - transcript
                    properties:
                      transcript:
                        type: array
                        items:
                          $ref: '#/components/schemas/TranscriptItem'
                  - $ref: '#/components/schemas/CallbackResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'
components:
  schemas:
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
    CallbackResponse:
      type: object
      required:
        - destination_url
      properties:
        destination_url:
          type: string
          format: uri
          example: https://example.com/destination
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
> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Get summary

> This endpoint has two behaviors depending on your request payload:
- If you send `destination_url`, the endpoint will behave in an asynchronous manner.
- If you do not send `destination_url`, the endpoint will return the data directly.




## OpenAPI

````yaml /api-reference/openapi.yaml get /recordings/{recording_id}/summary
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
  /recordings/{recording_id}/summary:
    get:
      tags:
        - Recordings
      summary: Get summary
      description: >
        This endpoint has two behaviors depending on your request payload:

        - If you send `destination_url`, the endpoint will behave in an
        asynchronous manner.

        - If you do not send `destination_url`, the endpoint will return the
        data directly.
      operationId: getRecordingSummary
      parameters:
        - name: recording_id
          in: path
          required: true
          description: The ID of the meeting recording to fetch the call summary for.
          schema:
            type: integer
            example: 123456789
        - in: query
          name: destination_url
          description: >-
            Destination URL for where we'll POST the call summary. If not sent,
            this endpoint will return the data directly.
          schema:
            type: string
            format: uri
            example: https://example.com/destination
      responses:
        '200':
          description: >-
            Either the destination URL for where we'll POST the call summary, or
            the summary for the recording.
          content:
            application/json:
              schema:
                anyOf:
                  - type: object
                    required:
                      - summary
                    properties:
                      summary:
                        $ref: '#/components/schemas/MeetingSummary'
                  - $ref: '#/components/schemas/CallbackResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'
components:
  schemas:
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
    CallbackResponse:
      type: object
      required:
        - destination_url
      properties:
        destination_url:
          type: string
          format: uri
          example: https://example.com/destination
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
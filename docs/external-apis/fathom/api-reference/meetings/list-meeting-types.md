> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# List meeting types

> List your org's meeting types, including both `active` and `inactive`. Use the returned `name` values as the meeting_type filter on GET /meetings.




## OpenAPI

````yaml /api-reference/openapi.yaml get /meeting_types
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
  /meeting_types:
    get:
      tags:
        - Meetings
      summary: List meeting types
      description: >
        List your org's meeting types, including both `active` and `inactive`.
        Use the returned `name` values as the meeting_type filter on GET
        /meetings.
      operationId: listMeetingTypes
      parameters:
        - in: query
          name: cursor
          description: Cursor for pagination.
          schema:
            type: string
      responses:
        '200':
          description: Paginated list of meeting types.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MeetingTypeListResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'
components:
  schemas:
    MeetingTypeListResponse:
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
            $ref: '#/components/schemas/MeetingType'
    MeetingType:
      type: object
      required:
        - name
        - status
        - created_at
      properties:
        name:
          type: string
          example: Quarterly Business Review
        status:
          type: string
          enum:
            - active
            - inactive
          description: >
            Whether the meeting type is currently assignable. `active` types can
            be assigned to meetings going forward; `inactive` types are no
            longer assigned going forward but may still appear on historical
            meetings.
          example: active
        created_at:
          type: string
          format: date-time
          example: '2023-11-10T12:00:00Z'
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
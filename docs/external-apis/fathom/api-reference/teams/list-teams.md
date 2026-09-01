> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# List teams



## OpenAPI

````yaml /api-reference/openapi.yaml get /teams
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
  /teams:
    get:
      tags:
        - Teams
      summary: List teams
      operationId: listTeams
      parameters:
        - in: query
          name: cursor
          description: Cursor for pagination.
          schema:
            type: string
      responses:
        '200':
          description: Paginated list of teams.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TeamListResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimited'
components:
  schemas:
    TeamListResponse:
      type: object
      required:
        - limit
        - next_cursor
        - items
      properties:
        limit:
          type: integer
        next_cursor:
          type: string
          nullable: true
        items:
          type: array
          items:
            $ref: '#/components/schemas/Team'
    Team:
      type: object
      required:
        - name
        - created_at
      properties:
        name:
          type: string
          example: Sales
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
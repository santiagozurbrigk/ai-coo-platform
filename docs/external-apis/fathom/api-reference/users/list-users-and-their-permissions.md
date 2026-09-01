> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# List users and their permissions

> List all users in the account with their permissions.

Admin only. Returns 403 Forbidden unless the API key belongs to a user with `settings_access` of `account_admin`.

Results include active, deactivated, then pending members; page through with `next_cursor`, or filter with `status`. Invited users have no permissions object yet, and their `created_at` is the invite date.




## OpenAPI

````yaml /api-reference/openapi.yaml get /users
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
  /users:
    get:
      tags:
        - Users
      summary: List users and their permissions
      description: >
        List all users in the account with their permissions.


        Admin only. Returns 403 Forbidden unless the API key belongs to a user
        with `settings_access` of `account_admin`.


        Results include active, deactivated, then pending members; page through
        with `next_cursor`, or filter with `status`. Invited users have no
        permissions object yet, and their `created_at` is the invite date.
      operationId: listUsers
      parameters:
        - in: query
          name: cursor
          description: Cursor for pagination.
          schema:
            type: string
        - in: query
          name: team
          description: Team name to filter by.
          schema:
            type: string
        - in: query
          name: status
          description: >-
            Filter by user status. `invited` cannot be combined with
            `settings_access`.
          schema:
            type: string
            enum:
              - active
              - deactivated
              - invited
        - in: query
          name: settings_access
          description: Filter by settings access level.
          schema:
            type: string
            enum:
              - none
              - team_admin
              - account_admin
      responses:
        '200':
          description: Paginated list of users.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '429':
          $ref: '#/components/responses/RateLimited'
components:
  schemas:
    UserListResponse:
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
            $ref: '#/components/schemas/User'
    User:
      type: object
      required:
        - name
        - email
        - created_at
        - status
      properties:
        name:
          type: string
          nullable: true
          example: Bob Lee
        email:
          type: string
          format: email
          example: bob.lee@acme.com
        created_at:
          type: string
          format: date-time
          example: '2024-06-01T08:30:00Z'
        status:
          $ref: '#/components/schemas/UserStatus'
        permissions:
          $ref: '#/components/schemas/UserPermissions'
    UserStatus:
      type: string
      enum:
        - active
        - deactivated
        - invited
    UserPermissions:
      type: object
      description: Omitted for invited users.
      required:
        - settings_access
        - view_access
      properties:
        settings_access:
          $ref: '#/components/schemas/UserSettingsAccess'
        view_access:
          $ref: '#/components/schemas/UserViewAccess'
    UserSettingsAccess:
      type: object
      required:
        - level
        - teams
      properties:
        level:
          type: string
          enum:
            - none
            - team_admin
            - account_admin
        teams:
          type: array
          description: >-
            Teams the level applies to - every team for `account_admin`, the
            administered teams for `team_admin`, empty for `none`.
          items:
            type: string
          example:
            - Sales
            - Customer Success
    UserViewAccess:
      type: object
      required:
        - level
        - teams
      properties:
        level:
          type: string
          enum:
            - own_meetings
            - team
            - multiple_teams
            - all_teams
        teams:
          type: array
          description: >-
            Teams whose meetings the user can view - every team for `all_teams`,
            the granted teams for `team` and `multiple_teams`, empty for
            `own_meetings`.
          items:
            type: string
          example:
            - Sales
  responses:
    BadRequest:
      description: Bad request - the query parameters were invalid.
    Unauthorized:
      description: Unauthorized - missing or invalid `Authorization` header.
    Forbidden:
      description: >-
        Forbidden - the authenticated user is not permitted to perform this
        request.
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
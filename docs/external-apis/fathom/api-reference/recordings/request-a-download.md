> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Request a download

> Starts async generation of a downloadable file and returns a `download_id` to poll. Video is generated in the background; audio-only recordings complete immediately, so the response may already return `status: completed` with the file payload.

Downloads are private to the API client that created them, and URLs expire ~24 hours after generation—request a new one when it expires.

Only the owner, teammates who can view the recording, and people it was shared with at standard or admin level can download it. Limited-access shares get `403 Forbidden`.




## OpenAPI

````yaml /api-reference/openapi.yaml post /recordings/{recording_id}/download
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
  /recordings/{recording_id}/download:
    post:
      tags:
        - Recordings
      summary: Request a download
      description: >
        Starts async generation of a downloadable file and returns a
        `download_id` to poll. Video is generated in the background; audio-only
        recordings complete immediately, so the response may already return
        `status: completed` with the file payload.


        Downloads are private to the API client that created them, and URLs
        expire ~24 hours after generation—request a new one when it expires.


        Only the owner, teammates who can view the recording, and people it was
        shared with at standard or admin level can download it. Limited-access
        shares get `403 Forbidden`.
      operationId: createRecordingDownload
      parameters:
        - name: recording_id
          in: path
          required: true
          description: The ID of the meeting recording to generate a download for.
          schema:
            type: integer
            example: 123456789
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                destination_url:
                  type: string
                  format: uri
                  description: >-
                    URL Fathom POSTs the completed download payload to when it
                    is ready. If omitted, poll the status endpoint.
                  example: https://example.com/destination
      responses:
        '202':
          description: >-
            The download request was accepted. Poll the download status endpoint
            until it completes.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RecordingDownload'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'
        '422':
          description: Unprocessable - the recording has no downloadable media.
        '429':
          $ref: '#/components/responses/RateLimited'
components:
  schemas:
    RecordingDownload:
      type: object
      required:
        - download_id
        - recording_id
        - status
      properties:
        download_id:
          type: string
          example: dl_CJAj1YPuruCgWHaKgEBv6Mb1UsNj8x
        recording_id:
          type: integer
          example: 123456789
        status:
          $ref: '#/components/schemas/RecordingDownloadStatus'
        video:
          $ref: '#/components/schemas/RecordingDownloadFile'
          description: Present when a video recording's download is completed.
        audio:
          $ref: '#/components/schemas/RecordingDownloadFile'
          description: Present when an audio-only recording's download is completed.
        failure_reason:
          type: string
          enum:
            - generation_failed
            - generation_timeout
          description: Present when the download failed.
    RecordingDownloadStatus:
      type: string
      enum:
        - processing
        - completed
        - failed
        - expired
      example: processing
    RecordingDownloadFile:
      type: object
      required:
        - url
        - content_type
        - file_size_bytes
        - expires_at
      properties:
        url:
          type: string
          format: uri
          description: >-
            Short-lived signed URL for the generated file. Valid until
            `expires_at`.
          example: https://media.fathom.ai/downloads/...
        content_type:
          type: string
          example: video/mp4
        file_size_bytes:
          type: integer
          example: 154763264
        expires_at:
          type: string
          format: date-time
          description: >-
            When the download and its URL expire. Request a new download after
            this time.
          example: '2026-07-13T18:30:00Z'
  responses:
    Unauthorized:
      description: Unauthorized - missing or invalid `Authorization` header.
    Forbidden:
      description: >-
        Forbidden - the authenticated user is not permitted to perform this
        request.
    NotFound:
      description: Not found - the resource was not found.
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
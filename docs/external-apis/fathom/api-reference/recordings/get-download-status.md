> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Get download status

> Returns the status of a download created with the request-a-download endpoint. When the
download is completed, the payload carries a short-lived signed URL for the generated
file. Only the API client that created the download can read it.




## OpenAPI

````yaml /api-reference/openapi.yaml get /recordings/{recording_id}/downloads/{download_id}
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
  /recordings/{recording_id}/downloads/{download_id}:
    get:
      tags:
        - Recordings
      summary: Get download status
      description: >
        Returns the status of a download created with the request-a-download
        endpoint. When the

        download is completed, the payload carries a short-lived signed URL for
        the generated

        file. Only the API client that created the download can read it.
      operationId: getRecordingDownload
      parameters:
        - name: recording_id
          in: path
          required: true
          description: The ID of the meeting recording the download belongs to.
          schema:
            type: integer
            example: 123456789
        - name: download_id
          in: path
          required: true
          description: The download ID returned when the download was requested.
          schema:
            type: string
            example: dl_CJAj1YPuruCgWHaKgEBv6Mb1UsNj8x
      responses:
        '200':
          description: The current status of the download.
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
---
title: "Reset an item in a queue"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/reset-queue-item"
seccion: "Social Planner > Category Queue > Reset an item in a queue"
api_version: "v3"
capturado: "2026-08-30"
metodo: "PUT"
path: "/social-media-posting/category/queues/:queueId/items/:itemId/reset"
---

# Reset an item in a queue

```http
PUT /social-media-posting/category/queues/:queueId/items/:itemId/reset
```

Resets a specific queue item to its original state, discarding any modifications made.

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **queueId** `string` _required_
- **itemId** `string` _required_

### Request body (application/json)

**Body required**

- **locationId** `string` _required_ — Location ID
- **sessionId** `string` — Edit session ID

```json
{
  "locationId": "609e126a1c4ae1001291e1b5",
  "sessionId": "60af88475f1b2c001f5d5f4b"
}
```

### Response (200 · application/json)

The queue item has been successfully reset.

**Schema**

- **success** `boolean` _required_
- **statusCode** `number` _required_
- **results** `object` _required_
- **traceId** `string`

```json
{
  "success": true,
  "statusCode": 200,
  "results": {
    "message": "Queue item reset successfully",
    "queueItem": {
      "_id": "60af88475f1b2c001f5d5f4b",
      "order": 1000,
      "variations": [
        {
          "_id": "60af88475f1b2c001f5d5f4c",
          "content": "Check out our latest blog post! #marketing #socialmedia",
          "mentions": [
            {
              "platform": "instagram",
              "username": "example_user",
              "offset": 10,
              "length": 12
            }
          ],
          "ogTags": {
            "metaLink": "https://example.com",
            "metaImage": "https://example.com/image.png",
            "ogTitle": "Example Title"
          }
        }
      ],
      "primaryImage": "https://example.com/images/post-image.png",
      "postId": "60af88475f1b2c001f5d5f4d",
      "post": {
        "_id": "61bb16833b3f2791f9715be2",
        "source": "composer",
        "locationId": "ve9EPM428h8vShlRW1KT",
        "platform": "google",
        "thumbnail": "https://storage.googleapis.com/your-bucket/media/video-thumbnail.jpeg",
        "displayDate": "2023-08-02T00:00:00.000Z",
        "createdAt": "2023-08-02T00:00:00.000Z",
        "updatedAt": "2023-08-02T00:00:00.000Z",
        "accountId": "w37swmmLbA02zgqKPpxITe",
        "error": "Failed due to auth token",
        "postId": "323534534435",
        "publishedAt": "2021-06-22T05:32:49.463Z",
        "accountIds": [
          "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"
        ],
        "summary": "Sample Summary",
        "media": [
          {
            "url": "https://example.com/image.jpg",
            "type": "image/jpeg",
            "caption": "Sample caption",
            "altText": "A sunset over the ocean with silhouetted palm trees"
          }
        ],
        "status": "published",
        "createdBy": "Lx1EI6YIgQYMQi0ytFXv",
        "type": "post",
        "tags": [
          "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"
        ],
        "ogTagsDetails": {
          "metaImage": "https://example.com/image.jpg",
          "metaLink": "https://www.yahoo.com/",
          "ogTitle": "Page Title",
          "ogDescription": "Page Description"
        },
        "postApprovalDetails": {
          "approver": "iVrVJ2uoXNF0wzcBzgl5",
          "approvalStatus": "approved"
        },
        "tiktokPostDetails": {
          "privacyLevel": "PUBLIC_TO_EVERYONE",
          "enableComment": true
        },
        "gmbPostDetails": {
          "gmbEventType": "STANDARD",
          "actionType": "BOOK"
        },
        "blueskyPostDetails": {
          "shortenedLinks": [
            "string"
          ],
          "replyTo": "at://did:plc:abc123def456/app.bsky.feed.post/xyz789",
          "quotePost": "at://did:plc:abc123def456/app.bsky.feed.post/xyz789",
          "language": "en",
          "externalLink": "https://yoursite.com/article",
          "externalLinkTitle": "10 Tips for Better Social Media Marketing",
          "externalLinkDescription": "Learn how to improve your social media presence with these proven strategies."
        },
        "user": {
          "id": "6284c43d519161e96cc09c13",
          "firstName": "Harry",
          "lastName": "Spencer",
          "email": "[email protected]"
        },
        "linkedinPostDetails": {
          "pdfTitle": "Q4 Marketing Strategy Presentation",
          "postAsPdf": true,
          "poll": {
            "question": "What is your favorite color?",
            "options": [
              {
                "text": "Red"
              }
            ],
            "settings": {
              "duration": "SEVEN_DAYS"
            }
          }
        },
        "pinterestPostDetails": {
          "title": "10 Easy Home Decor Ideas for 2024",
          "link": "https://yoursite.com/blog/home-decor-ideas",
          "pinterestBoards": [
            {
              "accountId": "6887d6de1d8175813d50dab8",
              "boards": [
                "987654321098765432",
                "234567890123456789"
              ]
            },
            {
              "accountId": "682c7d1710a2fe3d805a3513",
              "boards": [
                "111222333444555666"
              ]
            }
          ],
          "shortenedLinks": [
            "string"
          ]
        },
        "facebookPostDetails": {
          "type": "post",
          "textFormatPresetId": "303063890126415"
        },
        "instagramPostDetails": {
          "type": "post",
          "collaborators": {
            "accountId1": [
              "username1",
              "username2"
            ],
            "accountId2": [
              "username3",
              "username4"
            ]
          },
          "showOnFeed": true,
          "publishViaPushNotification": true,
          "publisherNote": "When publishing, add swipe up link to the landing page so that we can direct them to the sales page"
        },
        "youtubePostDetails": {
          "title": "How to Build a Successful Marketing Strategy in 2024",
          "privacyLevel": "public",
          "type": "video"
        },
        "mediaOptimization": true,
        "insights": {
          "like": 12,
          "share": 3,
          "comment": 5
        },
        "previewLink": "https://www.facebook.com/12345/posts/67890"
      },
      "errors": [
        "INVALID_USER_ID",
        "PIXABAY_MEDIA"
      ],
      "scheduledDateTime": "2023-10-15T10:00:00.000Z",
      "scheduledVariationIndex": 0,
      "isSkipped": false,
      "currentVariation": 0
    }
  },
  "traceId": "string"
}
```

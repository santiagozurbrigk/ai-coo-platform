---
title: "Create post"
source: "https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post"
seccion: "Social Planner > Post > Create post"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/social-media-posting/:locationId/posts"
---

# Create post

```http
POST /social-media-posting/:locationId/posts
```

Create posts for all supported platforms. It is possible to create customized posts per channel by using the same platform account IDs in a request and hitting the create post API multiple times with different summaries and account IDs per platform.

The content and media limitations, as well as platform rate limiters corresponding to the respective platforms, are provided in the following reference link:

Link: [Platform Limitations](https://help.leadconnectorhq.com/support/solutions/articles/48001240003-social-planner-image-video-content-and-api-limitations)

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Path parameters

- **locationId** `string` _required_ — Location Id

### Request body (application/json)

**Body required**

- **accountIds** `string[]` _required_ — Account IDs for the post. Each account ID identifies a connected social media account. **Get IDs from:** [Get Accounts API](https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post/get-account) — use the `id` field from each account. **Validations:**
  - Required for non-draft posts
  - Must be a non-empty array
  - All account IDs must be valid connected accounts for the location
- **summary** `string` — Post content/caption text. Character limits vary by platform. **Custom Values & Hashtags:** **Validations:** **Reference:** [Platform Limitations Guide](https://help.leadconnectorhq.com/support/solutions/articles/48001240003-social-planner-image-video-content-and-api-limitations)
  - You can include custom values/variables in the content (e.g., `{{contact.name}}`)
  - Hashtags: Use `#hashtag` format. Instagram allows max 30 hashtags.
  - Mentions: Use platform-specific mention format (see `mentions` field for structured mentions)
  - Instagram/Facebook Story: Caption NOT supported for direct publishing
  - Facebook, LinkedIn, GMB: Content OR media is required (at least one)
  - Content is automatically trimmed to platform limits
- **media** `object[]` — Post Media Data The limitations of media as per the platforms is provided through the reference link in API description
- **status** `string` — Post status indicating the current state of the post. **Available Status Values:** **Validations:**
  - Available options: `draft`, `scheduled`, `in_review`, `published`, `in_progress`, `pending`, `failed`, `notification_sent`, `deleted`
  - `draft` - Post saved as draft, not yet ready for publishing
  - `scheduled` - Post scheduled for future publishing (requires `scheduleDate`)
  - `in_review` - Post pending approval (requires `scheduleDate` and `postApprovalDetails`)
  - `published` - Post has been published
  - `in_progress` - Post is currently being processed
  - `pending` - Post is awaiting platform processing for Instagram media container creation
  - `failed` - Post publishing failed
  - `notification_sent` - Story notification sent (for manual story posting)
  - `deleted` - Post has been deleted
  - `scheduled` or `in_review` status requires `scheduleDate` to be set
  - Draft posts skip most validations (accountIds, media requirements)
- **scheduleDate** `string` — Schedule Date
- **selectedBestTime** `string` — Selected Best Time slot for scheduling
- **createdBy** `string` — User ID of the creator who is creating/managing the post. Must be a valid MongoDB ObjectId. **Get User IDs from:** [Get User API](https://marketplace.gohighlevel.com/docs/ghl/social-planner/users/get-user) — use the `id` field from the user object. **Validation:** Must be a valid MongoDB ObjectId.
- **followUpComment** `string` — Follow-up comment to be posted immediately after the main post is published. **Supported Platforms:** Facebook, Instagram, LinkedIn, YouTube, TikTok **NOT Supported:** Google My Business (GMB), Pinterest **Use Case:** Great for adding hashtags, additional context, or engagement prompts without cluttering the main post. **Reference:** [Platform Limitations Guide](https://help.leadconnectorhq.com/support/solutions/articles/48001240003-social-planner-image-video-content-and-api-limitations)
  - Follow-up comment is automatically trimmed to platform limits
  - TikTok: the comment is published once the video becomes publicly viewable on TikTok (typically 1-3 minutes after the post goes out), not immediately. Max 1,200 characters.
  - TikTok: only public videos are supported. Set `privacyLevel` to `PUBLIC_TO_EVERYONE`; friends-only and private videos are not supported.
- **ogTagsDetails** `object` — Og Tags Meta Data
- **type** `string` _required_ — Type of post to create. Determines the format and platform requirements. **Available Types:** **Customize Per Platform:** You can specify different content/types per platform using `facebookPostDetails.type`, `instagramPostDetails.type`, etc. **Validations:**
  - Available options: `post`, `story`, `reel`
  - `post` - Standard feed post (all platforms)
  - `story` - Temporary 24-hour story (Instagram, Facebook)
  - `reel` - Short-form video content (Instagram, Facebook, TikTok, YouTube)
  - Reels require exactly 1 video
  - Stories: Caption not supported for Instagram/Facebook
  - Facebook Groups do not support Reels
- **postApprovalDetails** `object` — Post Approval Details
- **scheduleTimeUpdated** `boolean` — Flag indicating if the schedule datetime was manually updated. Used for tracking rescheduled posts.
- **tags** `string[]` — Array of Tag IDs to associate with the post for organization and filtering. **Get Tag IDs from:** [Get Tags API](https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post/social-planner/get-tags-location-id) — use the `_id` field from each tag. **Validation:** All IDs must be valid MongoDB ObjectIds.
- **categoryId** `string` — Category ID to organize the post. Categories help group related posts. **Get Category IDs from:** [Get Categories API](https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post/social-planner/get-categories-location-id) — use the `_id` field. **Validation:** Must be a valid MongoDB ObjectId.
- **applyWatermark** `boolean` — Apply watermark to media in this post. **Note:** Watermarks are applied to images only. Videos are not watermarked.
- **tiktokPostDetails** `object` — Tiktok Post Details
- **gmbPostDetails** `object` — GMB Post Details
- **userId** `string` _required_ — User ID of the user creating/managing the post. Required for OAuth channel posts (non-draft).
- **linkedinPostDetails** `object` — LinkedIn-specific post configuration. **Key Fields:** **Limits:** **Reference:** [Platform Limitations Guide](https://help.leadconnectorhq.com/support/solutions/articles/48001240003-social-planner-image-video-content-and-api-limitations)
  - `postAsPdf`: Set to `true` to post images as a PDF carousel document
  - `pdfTitle`: Title for the PDF document (max 100 characters)
  - Max 9 images/videos for regular posts
  - Max 300 pages for PDF carousel
  - Max PDF size: 100 MB
- **pinterestPostDetails** `object` — Pinterest-specific post configuration. Required when posting to Pinterest accounts. **Required Fields:** **Optional Fields:** **Get Board IDs:** Use the Pinterest boards API or retrieve from connected account details. **Limits:** **Reference:** [Platform Limitations Guide](https://help.leadconnectorhq.com/support/solutions/articles/48001240003-social-planner-image-video-content-and-api-limitations)
  - `boardIds`: Object mapping account OAuth IDs to Pinterest board IDs
  - `title`: Pin title (max 100 characters)
  - `link`: Destination URL for the pin (max 2048 characters)
  - Max 1 image/video per pin
  - Caption max 800 characters
- **facebookPostDetails** `object` — Facebook-specific post configuration. **Key Fields:** **Restrictions:** **Reference:** [Platform Limitations Guide](https://help.leadconnectorhq.com/support/solutions/articles/48001240003-social-planner-image-video-content-and-api-limitations)
  - `type`: Post type (`post`, `story`, `reel`)
  - Facebook Groups do NOT support Reels
  - Reels require exactly 1 video
  - Stories do not support captions
- **instagramPostDetails** `object` — Instagram-specific post configuration. **Key Fields:** **Collaborators Structure:** Where `accountId` is from [Get Accounts API](https://marketplace.gohighlevel.com/docs/ghl/social-planner/create-post/get-account) and usernames are Instagram handles without @. **Restrictions:** **Reference:** [Platform Limitations Guide](https://help.leadconnectorhq.com/support/solutions/articles/48001240003-social-planner-image-video-content-and-api-limitations)
  - `type`: Post type (`post`, `story`, `reel`)
  - `collaborators`: Map of account IDs to Instagram usernames for collaboration invites (max 5 per account)
  - `showOnFeed`: Show reel on profile feed (for reels)

```json
{ "accountId": ["username1", "username2"] }
```

  - Media is REQUIRED for all Instagram posts
  - Max 30 hashtags allowed in caption
  - Stories do not support captions
  - Collaborators: Posts/Reels only (NOT Stories)
  - Reels require exactly 1 video
- **youtubePostDetails** `object` — YouTube-specific post configuration. **Key Fields:** **Limits:** **Requirements:**
  - `title`: Video title (max 100 characters)
  - `type`: Video type (`video` for regular videos, `short` for YouTube Shorts)
  - `privacyLevel`: Video visibility (`private`, `public`, `unlisted`)
  - Max 1 video per post
  - Caption (description) max 5,000 characters
  - Video is REQUIRED for YouTube posts
  - `type` field is required

```json
{
  "accountIds": [
    "aF3KhyL8JIuBwzK3m7Ly_iVrVJ2uoXNF0wzcBzgl5_12554616564525983496"
  ],
  "summary": "Hello World! Check out our latest updates. #social #marketing",
  "media": [
    {
      "url": "https://example.com/image.jpg",
      "type": "image/jpeg",
      "caption": "Sample caption",
      "altText": "A sunset over the ocean with silhouetted palm trees"
    }
  ],
  "status": "scheduled",
  "scheduleDate": "2024-01-15T10:00:00Z",
  "selectedBestTime": "2024-01-15T10:00:00Z",
  "createdBy": "65f151c99bc2bf3aaf970d72",
  "followUpComment": "What do you think? Let us know in the comments!",
  "ogTagsDetails": {
    "metaImage": "https://example.com/image.jpg",
    "metaLink": "https://www.yahoo.com/",
    "ogTitle": "Page Title",
    "ogDescription": "Page Description"
  },
  "type": "post",
  "postApprovalDetails": {
    "approver": "iVrVJ2uoXNF0wzcBzgl5",
    "approvalStatus": "pending"
  },
  "scheduleTimeUpdated": true,
  "tags": [
    "65f151c99bc2bf3aaf970d72",
    "65f151c99bc2bf3aaf970d73"
  ],
  "categoryId": "65f151c99bc2bf3aaf970d72",
  "applyWatermark": true,
  "tiktokPostDetails": {
    "privacyLevel": "PUBLIC_TO_EVERYONE",
    "enableComment": true,
    "enableDuet": false
  },
  "gmbPostDetails": {
    "gmbEventType": "STANDARD",
    "actionType": "BOOK",
    "url": "https://example.com"
  },
  "userId": "sdfdsfdsfEWEsdfsdsW32dd",
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
  }
}
```

### Response (201 · application/json)

Successful response

**Schema**

- **success** `boolean` _required_ — Success or Failure
- **statusCode** `number` _required_ — Status Code
- **message** `string` _required_ — Message
- **results** `object` — Requested Results

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Created Post",
  "results": {
    "post": {
      "_id": "61bb16833b3f2791f9715be2",
      "locationId": "ve9EPM428h8vShlRW1KT",
      "status": "published",
      "insights": {
        "like": 12,
        "share": 3,
        "comment": 5
      }
    }
  }
}
```

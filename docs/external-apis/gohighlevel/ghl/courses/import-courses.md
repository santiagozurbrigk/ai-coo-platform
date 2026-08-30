---
title: "Import Courses"
source: "https://marketplace.gohighlevel.com/docs/ghl/courses/import-courses"
seccion: "Courses > UNTAGGED > Import Courses"
api_version: "v3"
capturado: "2026-08-30"
metodo: "POST"
path: "/courses/courses-exporter/public/import"
---

# Import Courses

```http
POST /courses/courses-exporter/public/import
```

Import Courses through public channels

## Request

### Header parameters

- **Version** `string` _required_ — API Version
  - Available options: `v3`

### Request body (application/json)

**Body required**

- **locationId** `string` _required_
- **userId** `string`
- **products** `object[]` _required_

```json
{
  "locationId": "string",
  "userId": "string",
  "products": [
    {
      "title": "string",
      "description": "string",
      "imageUrl": "string",
      "categories": [
        {
          "title": "string",
          "visibility": "published",
          "thumbnailUrl": "string",
          "posts": [
            {
              "title": "string",
              "visibility": "published",
              "thumbnailUrl": "string",
              "contentType": "video",
              "description": "string",
              "bucketVideoUrl": "string",
              "postMaterials": [
                {
                  "title": "string",
                  "type": "pdf",
                  "url": "string"
                }
              ]
            }
          ],
          "subCategories": [
            {
              "title": "string",
              "visibility": "published",
              "thumbnailUrl": "string",
              "posts": [
                {
                  "title": "string",
                  "visibility": "published",
                  "thumbnailUrl": "string",
                  "contentType": "video",
                  "description": "string",
                  "bucketVideoUrl": "string",
                  "postMaterials": [
                    {
                      "title": "string",
                      "type": "pdf",
                      "url": "string"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      "instructorDetails": {
        "name": "string",
        "description": "string"
      }
    }
  ]
}
```

### Response (201)

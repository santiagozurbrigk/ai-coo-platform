---
title: "Retrieve a full list of all webinars published in your account (EverWebinar API)"
source: "https://support.webinarjam.com/en/articles/15370154-retrieve-a-full-list-of-all-webinars-published-in-your-account-everwebinar-api"
articulo_id: "15370154"
seccion: "API de EverWebinar"
capturado: "2026-08-30"
---

# Retrieve a full list of all webinars published in your account (EverWebinar API)

Method: POST

  Complete URL: [https://api.webinarjam.com/everwebinar/webinars](https://api.webinarjam.com/everwebinar/webinars)

The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key_*_ | string(64) |

_* Required fields_

The response body will be a JSON object containing an array of webinars. Each webinar object will contain:

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| webinar_id | integer | Webinar ID |
| webinar_hash _*_ | string | Webinar Hash |
| name | string | Webinar Name (Private) |
| title | string | Webinar Title (Public) |
| description | string | Webinar Description |
| schedules | array | Empty for right now |
| timezone | string | Webinar timezone |

_* webinar_hash: this parameter is used in case you want your API to be able to generate the webinar's [one-click registration link](https://support.webinarjam.com/*/articles/15370017)._

# Example CURL request

```
curl --data "api_key=demokey" https://api.webinarjam.com/everwebinar/webinars
```

# Example return

```
{    "status": "success",    "webinars": [        {            "webinar_id": 9,            "webinar_hash": "tuvw1234",            "name": "Demo6",            "title": "Demo6",            "description": "My automated webinar",            "schedules": [                "Instant replay",                "Just in time",                "Every day, 01:00 PM",                "Every Monday, 02:00 PM",                "Saturday, 6 Jan 2024, 03:00 PM"            ],            "timezone": "America/Los_Angeles"        }    ]}
```

---

Related Articles

- [Retrieve a full list of all webinars published in your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370149-retrieve-a-full-list-of-all-webinars-published-in-your-account-webinarjam-api)
- [Get details about one particular webinar from your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api)
- [Get details about one particular webinar from your account (EverWebinar API)](https://support.webinarjam.com/en/articles/15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api)
- [Register a user to a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)
- [Unsubscribe leads from a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370160-unsubscribe-leads-from-a-webinar-everwebinar-api)

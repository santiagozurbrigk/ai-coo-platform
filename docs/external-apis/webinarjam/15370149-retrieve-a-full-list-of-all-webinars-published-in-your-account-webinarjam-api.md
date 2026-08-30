---
title: "Retrieve a full list of all webinars published in your account (WebinarJam API)"
source: "https://support.webinarjam.com/en/articles/15370149-retrieve-a-full-list-of-all-webinars-published-in-your-account-webinarjam-api"
articulo_id: "15370149"
seccion: "API de WebinarJam"
capturado: "2026-08-30"
---

# Retrieve a full list of all webinars published in your account (WebinarJam API)

Method: POST

  Complete URL: [https://api.webinarjam.com/webinarjam/webinars](https://api.webinarjam.com/webinarjam/webinars)

The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key _*_ | string(64) |

_* Required fields_

The response body will be a JSON object containing an array of webinars. Each webinar object will contain:

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| webinar_id | integer | Webinar ID |
| webinar_hash _*_ | string | Webinar Hash |
| name | string | Webinar Name (Private) |
| title | string | Webinar Title (Public) |
| description | string | Webinar Description |
| type | string | Series of presentations, Single presentation, Always on, Right now |
| schedules | array | Array of schedules |
| timezone | string | Webinar timezone |

_* webinar_hash: this parameter is used in case you want your API to be able to generate the webinar's [one-click registration link](https://support.webinarjam.com/*/articles/15370017)._

**Example CURL request**

```
curl --data "api_key=demokey" https://api.webinarjam.com/webinarjam/webinars
```

# Example return

```
{    "status": "success",    "webinars": [        {            "webinar_id": 4,            "webinar_hash": "lmno3456",            "name": "Demo4",            "title": "Demo4",            "description": "Right now",            "type": "Right Now",            "schedules": [                "Right now"            ],            "timezone": "America/New_York"        },        {            "webinar_id": 3,            "webinar_hash": "hijk9012",            "name": "Demo3",            "title": "Demo3",            "description": "My always on webinar",            "type": "Always on",            "schedules": [                "Always on"            ],            "timezone": "America/New_York"        },        {            "webinar_id": 2,            "webinar_hash": "defg5678",            "name": "Demo2",            "title": "Demo2",            "description": "Description of webinar",            "type": "Single presentation",            "schedules": [                "Friday, 5 Jan 2024, 01:00 PM"            ],            "timezone": "America/Los_Angeles"        },        {            "webinar_id": 1,            "webinar_hash": "abcd1234",            "name": "Demo1",            "title": "Demo1",            "description": "A series of events",            "type": "Series of presentations",            "schedules": [                "Every day, 01:00 PM",                "Every Tuesday, 02:00 PM"            ],            "timezone": "America/Los_Angeles"        }    ]}
```

---

Related Articles

- [Get details about one particular webinar from your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api)
- [Register a user to a webinar (WebinarJam API)](https://support.webinarjam.com/en/articles/15370151-register-a-user-to-a-webinar-webinarjam-api)
- [Retrieve a full list of all webinars published in your account (EverWebinar API)](https://support.webinarjam.com/en/articles/15370154-retrieve-a-full-list-of-all-webinars-published-in-your-account-everwebinar-api)
- [Get details about one particular webinar from your account (EverWebinar API)](https://support.webinarjam.com/en/articles/15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api)
- [Register a user to a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)

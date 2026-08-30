---
title: "Get details about one particular webinar from your account (WebinarJam API)"
source: "https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api"
articulo_id: "15370150"
seccion: "API de WebinarJam"
capturado: "2026-08-30"
---

# Get details about one particular webinar from your account (WebinarJam API)

Method: POST

  Complete URL: [https://api.webinarjam.com/webinarjam/webinar](https://api.webinarjam.com/webinarjam/webinar)

The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key_*_ | string(64) |
| webinar_id_*_ | integer |

_* Required fields_

The response body will be a JSON object containing a webinar object with the following:

| **Name** | **Value** | **Parent** | **Description** |
| --- | --- | --- | --- |
| webinar_id | integer |  | Webinar ID |
| webinar_hash _****_ | string |  | Webinar Hash |
| name | string |  | Webinar Name (Private) |
| title | string |  | Webinar Title (Public) |
| description | string | ​ | Webinar Description |
| type | string |  | Series of presentations, Single presentation, Always on, Right now |
| schedules | array |  |  |
| date | string | schedules | Date and time of webinar |
| schedule | int | schedules | Schedule ID |
| comment | string | schedules | Schedule description |
| timezone | string |  | Webinar timezone |
| presenters | array |  | Presenters |
| name | string | presenters | Presenter Name |
| email | string | presenters | Presenter Email |
| picture | string | presenters | Presenter Image URL |
| registration_url | string |  | Registration URL |
| registration_type | string |  | paid / free |
| registration_fee | int |  | Registration Fee |
| registration_currency_*__*_ | string |  | Registration Currency |
| registration_checkout_url_*__*_ | string |  | Registration Checkout URL |
| registration_post_payment_url_*__*_ | string |  | Registration Post Payment URL |
| direct_live_room_url_**__*_ | string |  | Direct URL to the Live room |
| direct_replay_room_url_**__*_ | string |  | Direct URL to the Replay room |

_** This field will be returned only if they are enabled within that particular webinar configuration settings_

_*** These are generic links to the Live and Replay room, in case you want to send a user directly to those rooms without going through the Registration page_

_**** webinar_hash: this parameter is used in case you want your API to be able to generate the webinar’s [one-click registration link](https://support.webinarjam.com/*/articles/15370017)._

**Important:**The Schedule ID retrieved through the API does not match the Schedule ID shown in the Schedules tab of your webinar settings. Be sure to use the API-generated ID when making API requests.

# Example CURL request

```
curl --data "api_key=demokey&webinar_id=5" https://api.webinarjam.com/webinarjam/webinar
```

# Example return

```
{    "status": "success",    "webinar": {        "webinar_id": 5,        "webinar_hash": "pqrs7890",        "name": "Demo5",        "title": "Demo5",        "description": "Multiple events",        "type": null,        "schedules": [            {                "date": "2024-01-05 13:00",                "schedule": 34,                "comment": "Friday, 5 Jan 2024, 01:00 PM"            },            {                "date": "2024-01-06 14:00",                "schedule": 46,                "comment": "Saturday, 6 Jan 2024, 02:00 PM"            }        ],        "timezone": "America/Los_Angeles",        "presenters": [            {                "name": "John Doe",                "email": "[email protected]",                "picture": "https://test.s3.amazonaws.com/default_user.jpg"            }        ],        "registration_url": "https://event.webinarjam.com/register/5/pqrs7890",        "registration_type": "free",        "registration_fee": 0,        "registration_currency": "",        "registration_checkout_url": "",        "registration_post_payment_url": "",        "direct_live_room_url": "https://event.webinarjam.com/go/live/5/pqrs7890ab12",        "direct_replay_room_url": "https://event.webinarjam.com/go/replay/5/pqrs7890ab12"    }}
```

---

Related Articles

- [Retrieve a full list of all webinars published in your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370149-retrieve-a-full-list-of-all-webinars-published-in-your-account-webinarjam-api)
- [Register a user to a webinar (WebinarJam API)](https://support.webinarjam.com/en/articles/15370151-register-a-user-to-a-webinar-webinarjam-api)
- [Get a list of registrants and attendees (WebinarJam API)](https://support.webinarjam.com/en/articles/15370152-get-a-list-of-registrants-and-attendees-webinarjam-api)
- [Get details about one particular webinar from your account (EverWebinar API)](https://support.webinarjam.com/en/articles/15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api)
- [Register a user to a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)

---
title: "Get details about one particular webinar from your account (EverWebinar API)"
source: "https://support.webinarjam.com/en/articles/15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api"
articulo_id: "15370155"
seccion: "API de EverWebinar"
capturado: "2026-08-30"
---

# Get details about one particular webinar from your account (EverWebinar API)

Method: POST

  Complete URL: [https://api.webinarjam.com/everwebinar/webinar](https://api.webinarjam.com/everwebinar/webinar)

The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key* | string(64) |
| webinar_id* | integer |
| timezone ** | GMT-5 or GMT+2 or GMT+4:30 |

_* Required fields_

_** Required if your webinar timezone is set to “Auto-detect the user’s time zone”._

_** For webinars configured to automatically display the schedule in the attendee’s own time zone, the API will automatically convert the time zone to EST if the time zone is not passed to the API call._ The response body will be a JSON object containing a webinar object with the following:

| **Name** | **Value** | **Parent** | **Description** |
| --- | --- | --- | --- |
| webinar_id | integer |  | Webinar ID |
| name | string |  | Webinar Name (Private) |
| title | string |  | Webinar Title (Public) |
| webinar_hash _****_ | string |  | Webinar Hash |
| description | string | ​ | Webinar Description |
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

_Note: The number of returned schedules will match "Displayed schedules" setting from the EverWebinar schedules configuration for each webinar_

_**** webinar_hash: this parameter is used in case you want your API to be able to generate the webinar’s [one-click registration link](https://support.webinarjam.com/*/articles/15370017)._

**Important:**
- The Schedule ID retrieved through the API does not match the Schedule ID shown in the Schedules tab of your webinar settings. Be sure to use the API-generated ID when making API requests.
- The**number of schedules returned**by the API is determined by the **settings configured under Schedules > Displayed schedules** in your webinar settings.

# Example CURL request

```
curl --data "api_key=demokey&webinar_id=6" https://api.webinarjam.com/everwebinar/webinar
```

# Example return

```
{    "status": "success",    "webinar": {        "webinar_id": 6,        "webinar_hash": "uvw1234",        "name": "Demo6",        "title": "Demo6",        "description": "My automated webinar",        "schedules": [            {                "date": "2024-01-04 12:00",                "schedule": 54,                "comment": "Instant replay"            },            {                "date": "2024-01-05 12:00",                "schedule": 55,                "comment": "Just in time"            },            {                "date": "2024-01-05 13:00",                "schedule": 56,                "comment": "Every day, 01:00 PM"            }        ],        "timezone": "America/Los_Angeles",        "presenters": [            {                "name": "John Doe",                "email": "[email protected]",                "picture": "https://test.s3.amazonaws.com/default_user.jpg"            }        ],        "registration_url": "https://event.webinarjam.com/register/6/uvw1234",        "registration_type": "free",        "registration_fee": 0,        "registration_currency": "",        "registration_checkout_url": "",        "registration_post_payment_url": "",        "direct_live_room_url": "https://event.webinarjam.com/go/live/6/uvw1234ab12",        "direct_replay_room_url": "https://event.webinarjam.com/go/replay/6/uvw1234ab12"    }}
```

---

Related Articles

- [Schedule your webinar in EverWebinar](https://support.webinarjam.com/en/articles/15370041-schedule-your-webinar-in-everwebinar)
- [Get details about one particular webinar from your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api)
- [Retrieve a full list of all webinars published in your account (EverWebinar API)](https://support.webinarjam.com/en/articles/15370154-retrieve-a-full-list-of-all-webinars-published-in-your-account-everwebinar-api)
- [Register a user to a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)
- [Get a list of registrants and attendees (EverWebinar API)](https://support.webinarjam.com/en/articles/15370157-get-a-list-of-registrants-and-attendees-everwebinar-api)

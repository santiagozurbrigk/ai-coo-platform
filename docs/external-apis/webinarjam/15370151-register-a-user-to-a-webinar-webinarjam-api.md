---
title: "Register a user to a webinar (WebinarJam API)"
source: "https://support.webinarjam.com/en/articles/15370151-register-a-user-to-a-webinar-webinarjam-api"
articulo_id: "15370151"
seccion: "API de WebinarJam"
capturado: "2026-08-30"
---

# Register a user to a webinar (WebinarJam API)

Method: POST

  Complete URL: [https://api.webinarjam.com/webinarjam/register](https://api.webinarjam.com/webinarjam/register)

**IMPORTANT:** To register a person for a series of webinars, you must request the registration only **once** through the **first** schedule. The API will auto-register that person to all the following schedules within the series.

The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key_*_ | string(64) |
| webinar_id_*_{+} | integer |
| first_name_*_ | string |
| last_name_**_ | string, optional |
| email_*_ | string |
| country | string |
| state | string |
| schedule_*_{+} | int |
| timezone_id_****_ | int |
| ip_address | string, optional |
| phone_country_code_**_ | string, optional, with "+" |
| phone_**_ | string, optional, only numbers |
| twilio_consent_***_ | 1 (for true), 0 (for false) |

  _* Required fields_

  _** This field might be required depending on the configured settings for each webinar_

  {+}**_webinar_id_**_and **schedule** must be obtained from a previous API call to [retrieve the details](https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api) of whatever specific webinar you want to register the person to. Also, please note that one particular schedule ID might refer to an entire series of webinars, and thus all individual webinar sessions within the same series will have the same schedule ID. In order to pinpoint the specific individual session within a series, refer to the DATE parameter._

  _*** This field will be mandatory if the phone number field is enabled for the webinar_

  _**** This field is mandatory if the registrants are from Texas, USA. You can choose one of the following values for the field:_

    _2 for Mountain Time (US and Canada)_

    _3 for Central Time (US and Canada)_

**Using Custom Fields?**
If your webinar registration includes custom registration fields, you must retrieve the field **label** and, for Dropdown fields, the **corresponding option ID(s)** before submitting this request. See **[Use Custom Fields in a WebinarJam Registration API Call](https://support.webinarjam.com/en/articles/15370148-pass-custom-field-values-in-the-registration-api)**.

The response body will be a JSON object containing a user object with the following:

| **Name** | **Value** | **Description** |
| --- | --- | --- |
| webinar_id | integer | Webinar ID |
| webinar_hash | string | Webinar Hash |
| user_id | int | Attendee Internal ID |
| first_name | string | Attendee First Name |
| last_name_*_ | string | Attendee Last Name |
| phone_country_code_*_ | string | Attendee Phone Country Code |
| phone_*_ | string | Attendee Phone Number |
| email | string | Attendee Email |
| password_*_ | string | Attendee's unique password to the room |
| schedule | int | Attendee Schedule |
| date | string | Webinar date and time |
| timezone | string | Webinar timezone |
| country ID | int | Attendee's country code |
| country name | string | Attendee's country name |
| state ID | int | Attendee's state's code |
| state name | string | Attendee's state's name |
| live_room_url {+} | string | Live Room URL |
| replay_room_url {+} | string | Replay Room URL |
| thank_you_url {+} | string | Registration Success URL |

{+}**_live_room_url_**_, **replay_room_url** and **thank_you_url** are unique to each attendee_

*_These fields will be returned only if they are enabled within that particular webinar configuration settings_

# Example CURL request

```
curl --data "api_key=demokey&webinar_id=5&first_name=FirstName&last_name=LastName&[email protected]&phone_country_code=+1&phone=1234567890&schedule=34&twilio_consent=1" https://api.webinarjam.com/webinarjam/register
```

# Example return

```
{    "status": "success",    "user": {        "webinar_id": 5,        "webinar_hash": "pqrs7890",        "user_id": 1234567,        "first_name": "FirstName",        "last_name": "LastName",        "phone_country_code": "+1",        "phone": "1234567890",        "email": "[email protected]",        "password": null,        "schedule": 34,        "date": "2024-01-05 13:00",        "timezone": "America/Los_Angeles",        "live_room_url": "https://event.webinarjam.com/go/live/5/ab1cd2ef3",        "replay_room_url": "https://event.webinarjam.com/go/replay/5/ab1cd2ef3",        "thank_you_url": "https://event.webinarjam.com/registration/thank-you/5/ab1cd2ef3gh4"    }}
```

---

Related Articles

- [Use WebinarJam and EverWebinar APIs](https://support.webinarjam.com/en/articles/15370142-use-webinarjam-and-everwebinar-apis)
- [Get details about one particular webinar from your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api)
- [Get a list of registrants and attendees (WebinarJam API)](https://support.webinarjam.com/en/articles/15370152-get-a-list-of-registrants-and-attendees-webinarjam-api)
- [Register a user to a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)
- [Get a list of registrants and attendees (EverWebinar API)](https://support.webinarjam.com/en/articles/15370157-get-a-list-of-registrants-and-attendees-everwebinar-api)

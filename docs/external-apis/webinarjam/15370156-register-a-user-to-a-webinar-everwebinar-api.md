---
title: "Register a user to a webinar (EverWebinar API)"
source: "https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api"
articulo_id: "15370156"
seccion: "API de EverWebinar"
capturado: "2026-08-30"
---

# Register a user to a webinar (EverWebinar API)

Method: POST

  Complete URL: [https://api.webinarjam.com/everwebinar/register](https://api.webinarjam.com/everwebinar/register)

**IMPORTANT**: The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key_*_ | string(64) |
| webinar_id_*_{+} | integer |
| first_name_*_ | string |
| last_name_***_ | string, optional |
| email_*_ | string |
| country | string |
| state | string |
| schedule_*_{+} | int |
| timezone_id_^^^_ | int |
| ip_address | string, optional |
| phone_country_code_***_ | string, optional, with "+" |
| phone_***_ | string, optional, only numbers |
| twilio_consent**** | 1 (for true), 0 (for false) |
| timezone {-} | Examples: GMT-5 or GMT+2 or GMT+4:30 |
| date _*****_ | 2025-01-01 09:00 |

  _* Required fields_

  _** Required if your webinar timezone is set to “Auto-detect the user’s time zone”._

  _*** This field might be required depending on the configured settings for each webinar_

  _**** This field will be mandatory if the phone number field is enabled for the webinar_

  {+}_The **webinar_id** and **schedule** must be obtained from a previous API call to [retrieve the details](https://support.webinarjam.com/en/articles/15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api) of whatever specific webinar you want to register the person to. Also, please note that one particular schedule ID might refer to an entire series of webinars, and thus all individual webinar sessions within the same series will have the same schedule ID. In order to pin-point the specific individual session within a series, refer to the DATE parameter._

  {-} _For webinars configured to display the schedule in the attendee’s own time zone, the API will automatically convert the time zone to EST, unless you specify a particular time zone in your API call._

  _***** Use the DATE parameter to register a person to a specific webinar session date. Make sure it matches a valid date returned by a previous API call, or else the API will not be able to register the user to any event at all. Also, if the call was made using a custom timezone, make sure that the same timezone is passed with the request._

  _^^^ This field is mandatory if the registrants are from Texas, USA. You can choose one of the following values for the field:_

    _2 for Mountain Time (US and Canada)_

    _3 for Central Time (US and Canada)_

**Using Custom Fields?**
If your webinar registration includes custom registration fields, you must retrieve the field **label** and, for Dropdown fields, the **corresponding option ID(s)** before submitting this request. See **[Use Custom Fields in a WebinarJam Registration API Call](https://support.webinarjam.com/en/articles/15370148-pass-custom-field-values-in-the-registration-api)**.

The response body will be a JSON object containing a user object with the following:

| **Name** | **Value** | **Description** |
| --- | --- | --- |
| webinar_id | int | Webinar ID |
| webinar_hash | string | Webinar Hash |
| user_id | int | Attendee Internal ID |
| first_name | string | Attendee Name |
| last_name_*_ | string | Attendee Last Name |
| phone_country_code_*_ | string | Attendee Phone Country Code |
| phone_*_ | string | Attendee Phone Number |
| email | string | Attendee Email |
| password_*_ | string | Attendee unique password to the room |
| schedule | int | Attendee Schedule |
| date | string | Webinar date and time |
| timezone | string | Webinar timezone |
| country ID | integer | Attendee's country ID |
| country name | string | Attendee's country's name |
| state ID | integer | Attendee's state's ID |
| state name | string | Attendee's state's name |
| live_room_url {+} | string | Live Room URL |
| replay_room_url {+} | string | Replay Room URL |
| thank_you_url {+} | string | Registration Success URL |

{+}**_live_room_url_**_, **replay_room_url** and **thank_you_url** are unique to each attendee_

_* These fields will only be returned if they are enabled within the webinar’s configuration settings_

# Example CURL request

```
curl --data "api_key=demokey&webinar_id=6&first_name=FirstName&last_name=LastName&[email protected]&phone_country_code=+1&phone=1234567890&schedule=55&twilio_consent=1" https://api.webinarjam.com/everwebinar/register
```

# Example return

```
{    "status": "success",    "user": {        "webinar_id": 6,        "webinar_hash": "uvw1234",        "user_id": 1234567,        "first_name": "FirstName",        "last_name": "LastName",        "phone_country_code": "+1",        "phone": "1234567890",        "email": "[email protected]",        "password": null,        "schedule": "55",        "date": "2024-01-05 12:00",        "timezone": "America/Los_Angeles",        "live_room_url": "https://event.webinarjam.com/go/live/6/ab1cd2ef3",        "replay_room_url": "https://event.webinarjam.com/go/replay/6/ab1cd2ef3",        "thank_you_url": "https://event.webinarjam.com/registration/thank-you/6/ab1cd2ef3gh4"    }}
```

---

Related Articles

- [Register existing contacts with one click](https://support.webinarjam.com/en/articles/15370017-register-existing-contacts-with-one-click)
- [Register a user to a webinar (WebinarJam API)](https://support.webinarjam.com/en/articles/15370151-register-a-user-to-a-webinar-webinarjam-api)
- [Get a list of registrants and attendees (WebinarJam API)](https://support.webinarjam.com/en/articles/15370152-get-a-list-of-registrants-and-attendees-webinarjam-api)
- [Get details about one particular webinar from your account (EverWebinar API)](https://support.webinarjam.com/en/articles/15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api)
- [Get a list of registrants and attendees (EverWebinar API)](https://support.webinarjam.com/en/articles/15370157-get-a-list-of-registrants-and-attendees-everwebinar-api)

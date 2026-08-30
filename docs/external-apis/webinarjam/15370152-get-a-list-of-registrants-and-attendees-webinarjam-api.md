---
title: "Get a list of registrants and attendees (WebinarJam API)"
source: "https://support.webinarjam.com/en/articles/15370152-get-a-list-of-registrants-and-attendees-webinarjam-api"
articulo_id: "15370152"
seccion: "API de WebinarJam"
capturado: "2026-08-30"
---

# Get a list of registrants and attendees (WebinarJam API)

Method: POST

  Complete URL: [https://api.webinarjam.com/webinarjam/registrants](https://api.webinarjam.com/webinarjam/registrants)

The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key* | string(64) |
| webinar_id*{+} | integer |
| schedule_id{+} | int |
| attended_live | int, between 0 and 40 - All registrants1- Attended live session2 - Did not attend live session3 - Attended and left before a specific timestamp, with ‘attended_live_timestamp’4 - Attended and left after a specific timestamp, with ‘attended_live_timestamp |
| attended_replay | int, between 0 and 40 - All registrants1- Attended replay session2 - Did not attend replay session3 - Attended and left before a specific timestamp, with ‘attended_replay_timestamp’4 - Attended and left after a specific timestamp, with ‘attended_replay_timestamp |
| purchased | int, between 0 and 20 - All registrants1 - Purchased a product2 - Did not purchase a product |
| page | int, min: 1 |
| attended_live_timestamp | int, value in seconds, min: 0 |
| attended_replay_timestamp | int, value in seconds, min: 0 |
| date_range | int, min: 0, max: 80 - All Time1 - Today2 - yesterday3 - this week4 - last week5 - last 7 days6 - this month7 - last month8 - last 30 days |
| search | string |

_* Required fields_

_{+} webinar_id and schedule must be obtained from a previous API call to retrieve the details of whatever specific webinar you want the list of registrants and attendees from. Also, please note that one particular schedule ID might refer to an entire series of webinars, and thus all individual webinar sessions within the same series will have the same schedule ID. In order to pinpoint the specific individual session within a series, refer to the ‘date_range’ parameter._

The response body will be a JSON object containing a user object with the following:

| **Name** | **Value** | **Description** |
| --- | --- | --- |
| first_name | string | Registrant’s first name**​** |
| last_name***​** | string**​** | Registrant’s last name**​** |
| phone_country_code***​** | string**​** | Registrant’s phone country code |
| phone***​** | string**​** | Registrant’s phone number |
| email | string | Registrant’s email address **​** |
| ip | string | Registrant’s IP address |
| webinar | integer | Name of the webinar |
| schedule | integer | Schedule ID associated with the registrant’s chosen date and time |
| signup_date | integer | Date the registrant signed up for the webinar |
| attended_live | integer | Registrant’s live attendance status |
| date_live | integer | Date when the registrant watched the live webinar |
| entered_live | string | Time to enter the live room |
| time_live | string | Time spent in the live room |
| purchased_live | integer | Registrant’s purchase behavior in the live room |
| revenue_live | string | Revenue earned from the registrant’s purchase in the live room |
| attended_replay | integer | Registrant’s replay attendance status |
| date_replay | integer | Date when the registrant watched the replay webinar |
| time_replay | string | Time spent in the replay room |
| purchased_replay | integer | Registrant’s purchase behavior in the replay room |
| revenue_replay | string | Revenue earned from the registrant’s purchase in the replay room |
| subscribed | integer | Data explaining if the registrant is subscribed to notifications |
| gdpr_status | integer | Registrant’s GDPR acceptance status |
| gdpr_communications | integer | Data explains if the registrant from a GDPR region agreed to receive the webinar notifications |
| gdpr_status_date | integer | Date when the registrant chose their GDPR status |
| gdpr_status_ip | string | Registrant’s IP address |
| twilio_consented_at | integer | Date of consent to receive SMS for the webinar |
| utm_source | integer | Source of the registration, such as Facebook, Instagram, etc. |
| utm_medium | integer | Medium of the registration, such as email, affiliate, social, etc. |
| utm_campaign | integer | Campaign from which the registration is coming in, such as launch, promotional event, etc. |
| utm_term | integer | Specific ad keywords used in a campaign |
| utm_content | integer | The exact variation of the same link that the user used to register
​ |
| live_room | string | Live room link for the registrant
​ |
| replay_room | string | Replay room link for the registrant
​ |
| unsubscribe | string | Link to unsubscribe from webinar notifications for the registrant |

_* These fields will be returned only if they are enabled within the particular webinar configuration settings_

# Example CURL request

curl --data “api_key=demokey&webinar_id=556&schedule_id=903” [https://api.webinarjam.com/webinarjam/registrants](https://api.webinarjam.com/webinarjam/registrants)

# Example return

[![WebinarJam API return response](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454314100/d074138e5d4172521a7e52ce4d46/upload_4619840990262331270.png?expires=1788058800&signature=527ba61bbf7a8eda4ae6c8f47ae5bd89ce5f6770a7f7777d343ee1a2b6441689&req=diQiEsp%2FmYBfWfMW1HO4zdp3jJ72LZ%2BPVjtyNtQSr0WACIh3Om8Oxbf1VJin%0AnQIKW0H9DbgyQ0vjFFE%3D%0A)](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454314100/d074138e5d4172521a7e52ce4d46/upload_4619840990262331270.png?expires=1788058800&signature=527ba61bbf7a8eda4ae6c8f47ae5bd89ce5f6770a7f7777d343ee1a2b6441689&req=diQiEsp%2FmYBfWfMW1HO4zdp3jJ72LZ%2BPVjtyNtQSr0WACIh3Om8Oxbf1VJin%0AnQIKW0H9DbgyQ0vjFFE%3D%0A)

---

Related Articles

- [Get details about one particular webinar from your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api)
- [Register a user to a webinar (WebinarJam API)](https://support.webinarjam.com/en/articles/15370151-register-a-user-to-a-webinar-webinarjam-api)
- [Get details about one particular webinar from your account (EverWebinar API)](https://support.webinarjam.com/en/articles/15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api)
- [Register a user to a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)
- [Get a list of registrants and attendees (EverWebinar API)](https://support.webinarjam.com/en/articles/15370157-get-a-list-of-registrants-and-attendees-everwebinar-api)

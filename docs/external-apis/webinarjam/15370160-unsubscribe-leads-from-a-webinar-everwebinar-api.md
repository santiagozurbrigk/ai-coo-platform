---
title: "Unsubscribe leads from a webinar (EverWebinar API)"
source: "https://support.webinarjam.com/en/articles/15370160-unsubscribe-leads-from-a-webinar-everwebinar-api"
articulo_id: "15370160"
seccion: "API de EverWebinar"
capturado: "2026-08-30"
---

# Unsubscribe leads from a webinar (EverWebinar API)

Method: POST

  Complete URL: [https://api.webinarjam.com/everwebinar/unsubscribe](https://api.webinarjam.com/everwebinar/unsubscribe)

The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key* | string(64) |
| webinar_id* | integer |
| lead_id*{+} | integer |

_* Required fields_

_{+} lead_id must be retrieved from a previous API call to retrieve a list of registrants and attendees of the specific webinar you are looking at._

# Example CURL request

curl --data "api_key=demokey&webinar_id=561&lead_id=818" [https://api.webinarjam.com/everwebinar/unsubscribe](https://api.webinarjam.com/everwebinar/unsubscribe)

---

# API Call Response

In response to the API call, the output will show a **“204 No Content”** success message indicating that the lead has been unsubscribed from the webinar. The user will not receive any pending webinar notifications.

---

# Verifying Subscription Status

After the API call, you can verify if a registrant has been unsubscribed from the webinar:

  Go to **Registrants**.

  Choose the **Webinar Name**, **Session** and **Event**.

  Click **Go**.

  Scroll right to the **Subscribed** column.

  The column will show **“No”** after the API call runs successfully.

[![Subscription status of a webinar registrant](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454314307/e3643aa13556b8a2610f37d599ca/upload_4971365663427224400.png?expires=1788058800&signature=7f0b46ad6cca433059c5f22d04b6a257caadac23be0181676e23644e4f695b42&req=diQiEsp%2FmYJfXvMW1HO4zTmhjXTRCPE%2FA0ovFyISrx0kxMkLld8MDa%2BQiDIz%0AkIB%2FzyXv3tx5SW3nZy4%3D%0A)](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454314307/e3643aa13556b8a2610f37d599ca/upload_4971365663427224400.png?expires=1788058800&signature=7f0b46ad6cca433059c5f22d04b6a257caadac23be0181676e23644e4f695b42&req=diQiEsp%2FmYJfXvMW1HO4zTmhjXTRCPE%2FA0ovFyISrx0kxMkLld8MDa%2BQiDIz%0AkIB%2FzyXv3tx5SW3nZy4%3D%0A)

​

---

Related Articles

- [Use WebinarJam and EverWebinar APIs](https://support.webinarjam.com/en/articles/15370142-use-webinarjam-and-everwebinar-apis)
- [Unsubscribe leads from a webinar (WebinarJam API)](https://support.webinarjam.com/en/articles/15370153-unsubscribe-leads-from-a-webinar-webinarjam-api)
- [Get details about one particular webinar from your account (EverWebinar API)](https://support.webinarjam.com/en/articles/15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api)
- [Register a user to a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)
- [Get a list of registrants and attendees (EverWebinar API)](https://support.webinarjam.com/en/articles/15370157-get-a-list-of-registrants-and-attendees-everwebinar-api)

---
title: "Unsubscribe leads from a webinar (WebinarJam API)"
source: "https://support.webinarjam.com/en/articles/15370153-unsubscribe-leads-from-a-webinar-webinarjam-api"
articulo_id: "15370153"
seccion: "API de WebinarJam"
capturado: "2026-08-30"
---

# Unsubscribe leads from a webinar (WebinarJam API)

Method: POST

  Complete URL: [https://api.webinarjam.com/webinarjam/unsubscribe](https://api.webinarjam.com/webinarjam/unsubscribe)

The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key* | string(64) |
| webinar_id* | integer |
| lead_id*{+} | integer |

_*__Required fields_

_{+} lead_id must be retrieved from a previous API call to [retrieve a list of registrants and attendees](https://support.webinarjam.com/en/articles/15370152-get-a-list-of-registrants-and-attendees-webinarjam-api) of the specific webinar you are looking at._

# Example CURL request

curl --data "api_key=demokey&webinar_id=561&lead_id=818" [https://api.webinarjam.com/webinarjam/unsubscribe](https://api.webinarjam.com/webinarjam/unsubscribe)

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

[![Subscription status of a registrant](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454314121/0ccec498d341937da1ff964bf378/upload_756625087271760792.png?expires=1788058800&signature=92a06581120b013233bd22eb2697c5cc6d353a711c0feea7fb78956a22dc71eb&req=diQiEsp%2FmYBdWPMW1HO4zamRKkI9iuaxDGvS09jeXkss4XvMVR2aydDCRtZt%0AME0G8BdQa3%2BlB8SeMrQ%3D%0A)](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454314121/0ccec498d341937da1ff964bf378/upload_756625087271760792.png?expires=1788058800&signature=92a06581120b013233bd22eb2697c5cc6d353a711c0feea7fb78956a22dc71eb&req=diQiEsp%2FmYBdWPMW1HO4zamRKkI9iuaxDGvS09jeXkss4XvMVR2aydDCRtZt%0AME0G8BdQa3%2BlB8SeMrQ%3D%0A)

---

Related Articles

- [Use WebinarJam and EverWebinar APIs](https://support.webinarjam.com/en/articles/15370142-use-webinarjam-and-everwebinar-apis)
- [Get details about one particular webinar from your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api)
- [Register a user to a webinar (WebinarJam API)](https://support.webinarjam.com/en/articles/15370151-register-a-user-to-a-webinar-webinarjam-api)
- [Get a list of registrants and attendees (WebinarJam API)](https://support.webinarjam.com/en/articles/15370152-get-a-list-of-registrants-and-attendees-webinarjam-api)
- [Unsubscribe leads from a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370160-unsubscribe-leads-from-a-webinar-everwebinar-api)

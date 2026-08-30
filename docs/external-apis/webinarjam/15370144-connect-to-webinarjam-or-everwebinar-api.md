---
title: "Connect to WebinarJam or EverWebinar API"
source: "https://support.webinarjam.com/en/articles/15370144-connect-to-webinarjam-or-everwebinar-api"
articulo_id: "15370144"
seccion: "Introducción"
capturado: "2026-08-30"
---

# Connect to WebinarJam or EverWebinar API

**Applies to:**WebinarJam and EverWebinar

To connect to the API, you must first be approved and have a valid API key.

**Approval is required** before you can connect with the WebinarJam or EverWebinar API. If you have not done so, [apply for an API key](https://support.webinarjam.com/en/articles/15370143-apply-for-an-api-key-for-webinarjam-or-everwebinar).

---

# API endpoints

Use the following endpoints to connect:

  **WebinarJam API endpoint:** [https://api.webinarjam.com/webinarjam](https://api.webinarjam.com/webinarjam)

  **EverWebinar API endpoint:** [https://api.webinarjam.com/everwebinar](https://api.webinarjam.com/everwebinar)

Connections to the API server must be **secured with SSL**. Non-SSL connections will be dropped.

---

# Find your API key

To locate your API key:

  Go to the main [**Webinars dashboard**](https://app.webinarjam.com/webinars)

  Click the **Advanced** link above the module for any event.

  Click **API custom integration**to find the API key and other related details.

Your API key is **account-wide** and **does not change per webinar**.

[![](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454313828/3c5a800790dbe3aa078e9fd74482/upload_4627116348109793192.png?expires=1788058800&signature=8692e2cc00e5b9a10967239f77399c22cf01481d75ef34751de6438e714be07e&req=diQiEsp%2FnoldUfMW1HO4zedv8bpFhVgAGsr6FKB7lijq3VA5mluGNvL4r%2F0c%0AW%2BTUIrf0B5aRdoJCfp0%3D%0A)](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454313828/3c5a800790dbe3aa078e9fd74482/upload_4627116348109793192.png?expires=1788058800&signature=8692e2cc00e5b9a10967239f77399c22cf01481d75ef34751de6438e714be07e&req=diQiEsp%2FnoldUfMW1HO4zedv8bpFhVgAGsr6FKB7lijq3VA5mluGNvL4r%2F0c%0AW%2BTUIrf0B5aRdoJCfp0%3D%0A)

---

# Data privacy requirements

When using the WebinarJam or EverWebinar API, each user is responsible for ensuring that appropriate consent is collected from webinar registrants. People who sign up to attend a webinar must:

  Grant you permission to handle their personal data.

  Agree to be subscribed to your webinars.

  Grant you permission to communicate with them in the future.

Data privacy regulations vary depending on where you are located and where your registrants are located. If you are not sure what regulations you are subject to or how to comply, please consult with a legal professional.

---

# API call limits

The WebinarJam and EverWebinar API systems have a hardcoded limit of **20 API calls per second per user**, meaning that your script should not send more than 20 API calls per second to our API endpoint.

If you exceed this limit, the API returns a **429 (Too many requests)**error.

---

# Best practice for rate limits

To prevent the 429 error, implement your scripts in a queue system that throttles all outbound API calls to a maximum rate of 20 calls per second. If your script goes through a burst of activity, this will queue the outbound calls and process them in a first-in-first-out order without exceeding the limit.

---

Related Articles

- [Use external video hosting in WebinarJam and EverWebinar](https://support.webinarjam.com/en/articles/15370044-use-external-video-hosting-in-webinarjam-and-everwebinar)
- [Connect and use Zapier](https://support.webinarjam.com/en/articles/15370082-connect-and-use-zapier)
- [Use WebinarJam and EverWebinar APIs](https://support.webinarjam.com/en/articles/15370142-use-webinarjam-and-everwebinar-apis)
- [Apply for an API key for WebinarJam or EverWebinar](https://support.webinarjam.com/en/articles/15370143-apply-for-an-api-key-for-webinarjam-or-everwebinar)
- [Pass custom field values in the registration API](https://support.webinarjam.com/en/articles/15370148-pass-custom-field-values-in-the-registration-api)

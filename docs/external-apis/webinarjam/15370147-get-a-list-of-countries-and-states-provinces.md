---
title: "Get a list of countries and states/provinces"
source: "https://support.webinarjam.com/en/articles/15370147-get-a-list-of-countries-and-states-provinces"
articulo_id: "15370147"
seccion: "Utilidades"
capturado: "2026-08-30"
---

# Get a list of countries and states/provinces

Use this API endpoint to retrieve a list of countries and states and use the results to register people for a webinar via the Register endpoint.

  Method: POST

  Complete URL: [https://api.webinarjam.com/api/webinarjam/countries](https://api.webinarjam.com/api/webinarjam/countries)

The request must include all of the required fields, based on the table below:

| **Name** | **Value** |
| --- | --- |
| api_key* | string (64) |

* Required fields

The response body will be a JSON object containing a list of countries, states and state IDs.

# Example CURL request

```
curl --data "api_key=demokey" https://api.webinarjamdev.com/api/webinarjam/countries
```

​

---

Related Articles

- [Retrieve a full list of all webinars published in your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370149-retrieve-a-full-list-of-all-webinars-published-in-your-account-webinarjam-api)
- [Get details about one particular webinar from your account (WebinarJam API)](https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api)
- [Register a user to a webinar (WebinarJam API)](https://support.webinarjam.com/en/articles/15370151-register-a-user-to-a-webinar-webinarjam-api)
- [Unsubscribe leads from a webinar (WebinarJam API)](https://support.webinarjam.com/en/articles/15370153-unsubscribe-leads-from-a-webinar-webinarjam-api)
- [Register a user to a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)

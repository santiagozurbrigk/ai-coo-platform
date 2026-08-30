---
title: "Pass custom field values in the registration API"
source: "https://support.webinarjam.com/en/articles/15370148-pass-custom-field-values-in-the-registration-api"
articulo_id: "15370148"
seccion: "Utilidades"
capturado: "2026-08-30"
---

# Pass custom field values in the registration API

**Applies to:**WebinarJam and EverWebinar

To pass custom field values through the **Register** API endpoint, you must first retrieve the custom field configuration from your webinar.

---

# Step 1: Retrieve custom field details

Run the Get details about one particular webinar from your account call.

  [WebinarJam](https://support.webinarjam.com/en/articles/15370150-get-details-about-one-particular-webinar-from-your-account-webinarjam-api)

  [EverWebinar](https://support.webinarjam.com/en/articles/15370155-get-details-about-one-particular-webinar-from-your-account-everwebinar-api)

From the response, identify:

  The label associated with the custom field

  The answer ID values (for Dropdown fields only)

Refer to the screenshot below for an example of the custom field response structure.

[![Label and ID for custom fields](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454313946/069c0b3c43ba6d8a0c51947712b3/upload_3047211513124267335.png?expires=1788058800&signature=9456d10cc39a47180e654732d98fca1b63ed3411b5b134bef66162a2a0ed8008&req=diQiEsp%2FnohbX%2FMW1HO4ze18homdaBfNELzMplJDsAwgIVMoDy9B0tLeLilt%0AujmgX067rqLbQVqOpoQ%3D%0A)](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454313946/069c0b3c43ba6d8a0c51947712b3/upload_3047211513124267335.png?expires=1788058800&signature=9456d10cc39a47180e654732d98fca1b63ed3411b5b134bef66162a2a0ed8008&req=diQiEsp%2FnohbX%2FMW1HO4ze18homdaBfNELzMplJDsAwgIVMoDy9B0tLeLilt%0AujmgX067rqLbQVqOpoQ%3D%0A)

---

# Step 2: Use the field label in your registration call

  Each custom field has a label.

  The label must be used as the parameter name in your registration API request.

Example:

  Custom field question: “Where did you hear about us?”

  Associated label: whereDidYouHearAboutUs

In your registration request, use:

  “whereDidYouHearAboutUs”: …..

---

# Step 3: Pass the Field Value

## If the field type is Dropdown

  Each answer option has a unique ID.

  Pass the corresponding option ID in your registration request.

  If multiple answers are selected, include their IDs inside square brackets separated by commas:

    Example: “whereDidYouHearAboutUs”: ["id_1","id_2"]

## If the field type is Text Field

  No option ID is required.

  Pass the text value directly.

    Example: “company”: “XYZ”

---

Below is a complete registration API call example, including a text field and a dropdown custom field with two selected answers:
​

[![API register call with two custom fields](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454313955/3ed62edc9cdc4dc8ef8bb7a45019/upload_14080972770643007711.png?expires=1788058800&signature=7919f1cbe0da6805a4015b92afce0c44c86ac3fe7aa886a2d091f89ea18036a9&req=diQiEsp%2FnohaXPMW1HO4zeh432IMyQA2S49MtXzPQH7amdipjmg6%2F7iy6Tky%0AhI2KWTZ%2FzrEobb6bPGI%3D%0A)](https://webinarjam-b76537054df6.intercom-attachments-1.com/i/o/l6vyxewd/2454313955/3ed62edc9cdc4dc8ef8bb7a45019/upload_14080972770643007711.png?expires=1788058800&signature=7919f1cbe0da6805a4015b92afce0c44c86ac3fe7aa886a2d091f89ea18036a9&req=diQiEsp%2FnohaXPMW1HO4zeh432IMyQA2S49MtXzPQH7amdipjmg6%2F7iy6Tky%0AhI2KWTZ%2FzrEobb6bPGI%3D%0A)

### Learn more

  [Register a person to a specific webinar (WebinarJam API)](https://support.webinarjam.com/en/articles/15370151-register-a-user-to-a-webinar-webinarjam-api)

  [Register a person to a specific webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)

---

Related Articles

- [Set up paid webinar registration with PayPal](https://support.webinarjam.com/en/articles/15370023-set-up-paid-webinar-registration-with-paypal)
- [Connect and use Zapier](https://support.webinarjam.com/en/articles/15370082-connect-and-use-zapier)
- [Use WebinarJam and EverWebinar APIs](https://support.webinarjam.com/en/articles/15370142-use-webinarjam-and-everwebinar-apis)
- [Connect to WebinarJam or EverWebinar API](https://support.webinarjam.com/en/articles/15370144-connect-to-webinarjam-or-everwebinar-api)
- [Register a user to a webinar (EverWebinar API)](https://support.webinarjam.com/en/articles/15370156-register-a-user-to-a-webinar-everwebinar-api)

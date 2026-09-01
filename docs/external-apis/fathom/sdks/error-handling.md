> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Error Handling

> Handle errors with the Fathom SDKs

## Error Handling

Both TypeScript and Python SDKs provide comprehensive error handling capabilities. The base error class is `FathomError` for both SDKs.

### Basic Error Handling

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';
  import * as errors from 'fathom-typescript/models/errors';

  const fathom = new Fathom({
    security: {
      apiKeyAuth: "YOUR_API_KEY"
    }
  });

  try {
    const result = await fathom.listMeetings({});
    for await (const page of result) {
      console.log(page);
    }
  } catch (error) {
    if (error instanceof errors.FathomError) {
      console.log(error.message);
      console.log(error.statusCode);
      console.log(error.body);
      console.log(error.headers);
    }
  }
  ```

  ```python Python theme={null}
  from fathom_python import Fathom, errors, models

  with Fathom(
      security=models.Security(
          api_key_auth="YOUR_API_KEY",
      ),
  ) as fathom:
      try:
          res = fathom.list_meetings()
          while res is not None:
              print(res)
              res = res.next()
      except errors.FathomError as e:
          print(f"Error: {e.message}")
          print(f"Status Code: {e.status_code}")
          print(f"Body: {e.body}")
          print(f"Headers: {e.headers}")
  ```
</CodeGroup>

### Handle Specific Status Codes

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';
  import * as errors from 'fathom-typescript/models/errors';

  async function handleSpecificErrors() {
    const fathom = new Fathom({
      security: {
        apiKeyAuth: "YOUR_API_KEY"
      }
    });

    try {
      const result = await fathom.listMeetings({});
      return result;
    } catch (error) {
      if (error instanceof errors.FathomError) {
        switch (error.statusCode) {
          case 401:
            console.log("Authentication failed. Check your API key.");
            break;
          case 403:
            console.log("Access forbidden. Check your permissions.");
            break;
          case 404:
            console.log("Resource not found.");
            break;
          case 429:
            console.log("Rate limit exceeded. Try again later.");
            break;
          default:
            if (error.statusCode >= 500) {
              console.log("Server error. Try again later.");
            } else {
              console.log(`Unexpected error: ${error.message}`);
            }
        }
      }
      return null;
    }
  }
  ```

  ```python Python theme={null}
  from fathom_python import Fathom, errors, models

  def handle_specific_errors():
      with Fathom(
          security=models.Security(
              api_key_auth="YOUR_API_KEY",
          ),
      ) as fathom:
          try:
              res = fathom.list_meetings()
              return res
          except errors.FathomError as e:
              if e.status_code == 401:
                  print("Authentication failed. Check your API key.")
              elif e.status_code == 403:
                  print("Access forbidden. Check your permissions.")
              elif e.status_code == 404:
                  print("Resource not found.")
              elif e.status_code == 429:
                  print("Rate limit exceeded. Try again later.")
              elif e.status_code >= 500:
                  print("Server error. Try again later.")
              else:
                  print(f"Unexpected error: {e.message}")
              return None
  ```
</CodeGroup>

### Error Classes

**Primary error:**

* `FathomError`: The base class for HTTP error responses.

**Network errors (TypeScript):**

* `ConnectionError`: HTTP client was unable to make a request to a server.
* `RequestTimeoutError`: HTTP request timed out due to an AbortSignal signal.
* `RequestAbortedError`: HTTP request was aborted by the client.
* `InvalidRequestError`: Any input used to create a request is invalid.
* `UnexpectedClientError`: Unrecognised or unexpected error.

**Network errors (Python):**

* `httpx.RequestError`: Base class for request errors.
* `httpx.ConnectError`: HTTP client was unable to make a request to a server.
* `httpx.TimeoutException`: HTTP request timed out.

**Inherit from `FathomError`:**

* `ResponseValidationError`: Type mismatch between the response data and the expected model structure.

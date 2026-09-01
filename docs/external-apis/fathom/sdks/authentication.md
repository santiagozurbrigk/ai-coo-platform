> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Authentication

> Authenticate with the Fathom SDKs using API keys

## API Key Authentication

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  const fathom = new Fathom({
    security: {
      apiKeyAuth: process.env.FATHOM_API_KEY_AUTH || ""
    }
  });
  ```

  ```python Python theme={null}
  from fathom_python import models, Fathom
  import os

  fathom = Fathom(security=models.Security(
      api_key_auth=os.getenv("FATHOM_API_KEY_AUTH", "")
  ))
  ```
</CodeGroup>

## Bearer Token Authentication

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  const fathom = new Fathom({
    security: {
      bearerAuth: "YOUR_BEARER_TOKEN"
    }
  });
  ```

  ```python Python theme={null}
  from fathom_python import models, Fathom

  fathom = Fathom(security=models.Security(
      bearer_auth="YOUR_BEARER_TOKEN"
  ))
  ```
</CodeGroup>

## Security Schemes

| Name         | Type   | Environment Variable  |
| ------------ | ------ | --------------------- |
| `apiKeyAuth` | apiKey | `FATHOM_API_KEY_AUTH` |
| `bearerAuth` | http   | `FATHOM_BEARER_AUTH`  |

## Security Best Practices

* Use environment variables for credentials
* Use OAuth for multi-user integrations
* Rotate API keys regularly
* Monitor API usage

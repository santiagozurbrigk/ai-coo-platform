> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Advanced Configuration

> Advanced options and configurations for the Fathom SDKs

## Advanced Configuration

Configure your SDK for production use with custom settings, debugging, and optimization.

### Server Selection

Override the default server URL when needed:

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from "fathom";

  const fathom = new Fathom({
    serverUrl: "https://api.fathom.ai/external/v1",
    security: {
      apiKeyAuth: "YOUR_API_KEY"
    }
  });
  ```

  ```python Python theme={null}
  from fathom_python import Fathom, models
  import os

  with Fathom(
      server_url="https://api.fathom.ai/external/v1",
      security=models.Security(
          api_key_auth=os.getenv("FATHOM_API_KEY_AUTH", ""),
      ),
  ) as fathom:
      res = fathom.list_meetings()
      while res is not None:
          res = res.next()
  ```
</CodeGroup>

### Custom HTTP Client

Customize headers and other HTTP client settings:

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from "fathom";

  const fathom = new Fathom({
    security: {
      apiKeyAuth: "YOUR_API_KEY"
    }
  });
  ```

  ```python Python theme={null}
  from fathom_python import Fathom, models
  import httpx

  http_client = httpx.Client(headers={"x-custom-header": "someValue"})
  fathom = Fathom(client=http_client, security=models.Security(api_key_auth="YOUR_API_KEY"))
  ```
</CodeGroup>

### Standalone Functions (TypeScript Only)

Use standalone functions for bundle size optimization:

```typescript theme={null}
import { listMeetings } from "fathom";

const result = await listMeetings({
  security: {
    apiKeyAuth: "YOUR_API_KEY"
  }
});

for await (const page of result) {
  console.log(page);
}
```

#### Available Standalone Functions

* `createWebhook` - Create a webhook
* `deleteWebhook` - Delete a webhook
* `listMeetings` - List meetings
* `listTeamMembers` - List team members
* `listTeams` - List teams

### Retries (Python Only)

Configure retry strategies for production reliability:

```python theme={null}
from fathom_python import Fathom, models
from fathom_python.utils import BackoffStrategy, RetryConfig
import os

with Fathom(
    retry_config=RetryConfig("backoff", BackoffStrategy(1, 50, 1.1, 100), False),
    security=models.Security(
        api_key_auth=os.getenv("FATHOM_API_KEY_AUTH", ""),
    ),
) as fathom:
    res = fathom.list_meetings()
    
    while res is not None:
        res = res.next()
```

### Resource Management (Python Only)

Use context managers for proper resource cleanup:

```python theme={null}
from fathom_python import Fathom, models
import os

def main():
    with Fathom(
        security=models.Security(
            api_key_auth=os.getenv("FATHOM_API_KEY_AUTH", ""),
        ),
    ) as fathom:
        # Rest of application here...
```

### Debugging

Enable debug logging during development:

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from "fathom";

  const fathom = new Fathom({
    security: {
      apiKeyAuth: "YOUR_API_KEY"
    }
  });

  // Manual debug logging
  console.log('Making API request...');
  const result = await fathom.listMeetings({});
  console.log('Response received:', result);
  ```

  ```python Python theme={null}
  from fathom_python import Fathom, models
  import logging
  import os

  # Setup debug logging
  logging.basicConfig(level=logging.DEBUG)
  fathom = Fathom(debug_logger=logging.getLogger("fathom_python"))

  # Or enable via environment variable
  # export FATHOM_DEBUG=true

  with Fathom(
      security=models.Security(
          api_key_auth=os.getenv("FATHOM_API_KEY_AUTH", ""),
      ),
  ) as fathom:
      res = fathom.list_meetings()
      while res is not None:
          res = res.next()
  ```
</CodeGroup>

### Configuration Best Practices

1. **Use environment variables** for sensitive configuration
2. **Implement proper error handling** with try-catch blocks
3. **Use context managers (Python)** for resource cleanup
4. **Configure timeouts** appropriate for your use case
5. **Enable debugging** during development
6. **Use standalone functions (TypeScript)** for bundle optimization
7. **Configure retries** for production reliability

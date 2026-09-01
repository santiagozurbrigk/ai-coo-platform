> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Python SDK Changes

> Breaking changes in Python SDK version 0.0.30

## Python SDK Breaking Changes

<Warning>Version 0.0.30 introduces breaking changes for the Python SDK. Older versions continue to work but don't support OAuth.</Warning>

### API Key Authentication Syntax

The API key authentication syntax has changed to support the new security model.

#### Old Syntax

```python theme={null}
from fathom_python import Fathom

fathom = Fathom("your_api_key")
```

#### New Syntax

```python theme={null}
from fathom_python import models, Fathom

fathom = Fathom(security=models.Security(api_key_auth="your_api_key"))
```

### OAuth Support

Version 0.0.30 adds OAuth support, which requires the new client structure:

```python theme={null}
from fathom_python import Fathom

# OAuth authorization URL generation
url = Fathom.get_authorization_url(
    "YOUR_CLIENT_ID",  # client ID
    "your_redirect_url",
    "public_api",  # required scope
    "randomState123"
)

# OAuth client initialization
token_store = Fathom.new_token_store()
fathom = Fathom(security=Fathom.with_authorization(
    "YOUR_CLIENT_ID",  # client_id
    "YOUR_CLIENT_SECRET",  # client_secret
    "AUTHORIZATION_CODE_FROM_CALLBACK",  # code
    'your_redirect_uri',
    token_store
))
```

### Migration Guide

To migrate from an older version to 0.0.30:

1. **Update imports**:
   ```python theme={null}
   # Old
   from fathom_python import Fathom

   # New
   from fathom_python import models, Fathom
   ```

2. **Update client initialization**:
   ```python theme={null}
   # Old
   fathom = Fathom("your_api_key")

   # New
   fathom = Fathom(security=models.Security(api_key_auth="your_api_key"))
   ```

3. **Update method calls** (if any method signatures changed):
   ```python theme={null}
   # Method calls remain the same
   result = fathom.list_meetings()
   ```

### Context Manager Usage

The new version encourages the use of context managers for proper resource management:

#### Old Usage

```python theme={null}
from fathom_python import Fathom

fathom = Fathom("your_api_key")
result = fathom.list_meetings()
print(result)
```

#### New Usage (Recommended)

```python theme={null}
from fathom_python import models, Fathom

with Fathom(
    security=models.Security(
        api_key_auth="your_api_key",
    ),
) as fathom:
    result = fathom.list_meetings()
    print(result)
```

### Asynchronous Support

Version 0.0.30 includes improved asynchronous support:

```python theme={null}
import asyncio
from fathom_python import models, Fathom

async def main():
    async with Fathom(
        security=models.Security(
            api_key_auth="your_api_key",
        ),
    ) as fathom:
        result = await fathom.list_meetings_async()
        print(result)

asyncio.run(main())
```

### Backward Compatibility

<Note>Older versions of the SDK continue to work with API key authentication, but they don't support OAuth features.</Note>

If you need to maintain compatibility with older code while adding OAuth support, you can:

1. **Pin to the old version** for existing applications
2. **Create a new integration** using version 0.0.30 for OAuth features
3. **Gradually migrate** existing code to the new syntax

### Version Pinning

We recommend pinning to a specific version to avoid unexpected breaking changes:

#### pip

```bash theme={null}
pip install fathom-python==0.0.30
```

#### requirements.txt

```
fathom-python==0.0.30
```

#### pyproject.toml (Poetry)

```toml theme={null}
[tool.poetry.dependencies]
fathom-python = "0.0.30"
```

### What's New in 0.0.30

* ✅ OAuth 2.0 support
* ✅ Improved security model
* ✅ Better Pydantic integration
* ✅ Enhanced error handling
* ✅ Context manager support
* ✅ Asynchronous operations
* ✅ Resource management improvements
* ✅ Better type hints

### Environment Variables

The new version supports environment variables for configuration:

```python theme={null}
import os
from fathom_python import models, Fathom

with Fathom(
    security=models.Security(
        api_key_auth=os.getenv("FATHOM_API_KEY_AUTH", ""),
    ),
) as fathom:
    result = fathom.list_meetings()
    print(result)
```

### Error Handling Improvements

The new version includes better error handling with specific error types:

```python theme={null}
from fathom_python import Fathom, errors, models

with Fathom(
    security=models.Security(
        api_key_auth="your_api_key",
    ),
) as fathom:
    try:
        result = fathom.list_meetings()
        print(result)
    except errors.FathomError as e:
        print(f"API Error: {e.message}")
    except errors.ResponseValidationError as e:
        print(f"Validation Error: {e.message}")
```

> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Python Installation

> Install the Fathom Python SDK

## How to Install

<CodeGroup>
  ```bash pip theme={null}
  pip install fathom-python
  ```

  ```bash poetry theme={null}
  poetry add fathom-python
  ```

  ```bash uv theme={null}
  uvx --from fathom-python python
  ```
</CodeGroup>

## Requirements

The Python SDK supports Python 3.9+ and works with most modern Python environments.

## Module Systems

The Python SDK works with standard Python import syntax:

```python theme={null}
from fathom_python import models, Fathom
```

## IDE Support

For PyCharm users, install the [PyCharm Pydantic Plugin](https://docs.pydantic.dev/latest/integrations/pycharm/) for better integration with Pydantic models.

## Alternative Installation Methods

### Shell and Script Usage with `uv`

You can use this SDK in a Python shell with [uv](https://docs.astral.sh/uv/) and the `uvx` command:

<CodeGroup>
  ```shell Shell usage theme={null}
  uvx --from fathom-python python
  ```

  ```python Standalone script theme={null}
  #!/usr/bin/env -S uv run --script
  # /// script
  # requires-python = ">=3.9"
  # dependencies = [
  #     "fathom-python",
  # ]
  # ///

  from fathom_python import Fathom

  sdk = Fathom(
    # SDK arguments
  )

  # Rest of script here...
  ```
</CodeGroup>

Once that is saved to a file, you can run it with `uv run script.py` where `script.py` can be replaced with the actual file name.

## Quick Start

After installation, you can quickly test your setup:

```python theme={null}
from fathom_python import models, Fathom

with Fathom(
    security=models.Security(
        api_key_auth="YOUR_API_KEY",
    ),
) as fathom:
    result = fathom.list_meetings()
    print(result)
```

## Version Management

This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage to a specific package version:

```bash theme={null}
pip install fathom-python==0.0.30
```

Or with poetry:

```bash theme={null}
poetry add fathom-python@0.0.30
```

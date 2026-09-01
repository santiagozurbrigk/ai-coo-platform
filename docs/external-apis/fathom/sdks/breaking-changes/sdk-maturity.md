> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# SDK Maturity

> Information about SDK maturity and version management

## SDK Maturity

<Note>Both TypeScript and Python SDKs are currently in beta, and there may be breaking changes between versions without a major version update.</Note>

### Beta Status

Our SDKs are currently in beta, which means:

* **Active development**: We're actively improving and adding features
* **Breaking changes**: There may be breaking changes between versions
* **Feedback welcome**: We encourage feedback and bug reports
* **Production ready**: The SDKs are stable enough for production use

### Version Management

We recommend pinning usage to a specific package version to avoid breaking changes unless you are intentionally looking for the latest version.

#### TypeScript SDK

```json theme={null}
{
  "dependencies": {
    "fathom-typescript": "0.0.30"
  }
}
```

#### Python SDK

```bash theme={null}
pip install fathom-python==0.0.30
```

Or in `requirements.txt`:

```
fathom-python==0.0.30
```

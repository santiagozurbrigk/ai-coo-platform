> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# TypeScript Installation

> Install the Fathom TypeScript SDK

## How to Install

<CodeGroup>
  ```bash npm theme={null}
  npm install fathom-typescript
  ```

  ```bash yarn theme={null}
  yarn add fathom-typescript
  ```

  ```bash pnpm theme={null}
  pnpm add fathom-typescript
  ```
</CodeGroup>

<Note>This package is published with CommonJS and ES Modules (ESM) support.</Note>

## Requirements

For supported JavaScript runtimes, please consult the [RUNTIMES.md](https://github.com/fathom/fathom-typescript/blob/main/RUNTIMES.md) file in the SDK repository.

## Module Systems

The SDK supports both CommonJS and ES Modules:

<CodeGroup>
  ```typescript ES Modules (Recommended) theme={null}
  import { Fathom } from 'fathom-typescript';
  ```

  ```javascript CommonJS theme={null}
  const { Fathom } = require('fathom-typescript');
  ```
</CodeGroup>

## Quick Start

After installation, you can quickly test your setup:

```typescript theme={null}
import { Fathom } from 'fathom-typescript';

const fathom = new Fathom({
  security: {
    apiKeyAuth: "YOUR_API_KEY"
  }
});

const result = await fathom.listMeetings({});
console.log(result);
```

## Standalone Functions

All SDK methods are available as standalone functions, ideal for applications where bundle size is a concern:

```typescript theme={null}
import { listMeetings } from 'fathom-typescript';

const result = await listMeetings({
  security: {
    apiKeyAuth: "YOUR_API_KEY"
  }
});

for await (const page of result) {
  console.log(page);
}
```

### Available Standalone Functions

* `listMeetings` - List meetings
* `listTeams` - List teams
* `listTeamMembers` - List team members
* `createWebhook` - Create a webhook
* `deleteWebhook` - Delete a webhook

### Tree Shaking

When using a bundler, unused functionality will be excluded from the final bundle:

```typescript theme={null}
// Only listMeetings will be included in the bundle
import { listMeetings } from 'fathom-typescript';

// This won't be included if not used
// import { createWebhook } from 'fathom-typescript';
```

## Version Management

This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage to a specific package version:

```json theme={null}
{
  "dependencies": {
    "fathom-typescript": "0.0.30"
  }
}
```

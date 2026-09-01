> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# TypeScript SDK Changes

> Breaking changes in TypeScript SDK version 0.0.30

## TypeScript SDK Breaking Changes

<Warning>Version 0.0.30 introduces breaking changes for the TypeScript SDK. Older versions continue to work but don't support OAuth.</Warning>

### Client Class Name Change

The client is now called `Fathom` instead of `FathomApi`.

#### Old Syntax

```typescript theme={null}
import { FathomApi } from 'fathom-typescript';

const fathom = new FathomApi("apikey");
```

#### New Syntax

```typescript theme={null}
import { Fathom } from 'fathom-typescript';

const fathom = new Fathom({security: {apiKeyAuth: "apikey"}});
```

### API Key Authentication Syntax

The API key authentication syntax has changed to support the new security model.

#### Old Syntax

```typescript theme={null}
import { FathomApi } from 'fathom-typescript';

const fathom = new FathomApi("your_api_key");
```

#### New Syntax

```typescript theme={null}
import { Fathom } from 'fathom-typescript';

const fathom = new Fathom({
  security: {
    apiKeyAuth: "your_api_key"
  }
});
```

### OAuth Support

Version 0.0.30 adds OAuth support, which requires the new client structure:

```typescript theme={null}
import { Fathom } from 'fathom-typescript';

// OAuth authorization URL generation
const url = Fathom.getAuthorizationUrl({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'https://your_redirect_url',
  scope: 'public_api',
  state: 'randomState123',
});

// OAuth client initialization
const tokenStore = Fathom.newTokenStore();
const fathom = new Fathom({
  security: Fathom.withAuthorization({
    clientId: "YOUR_CLIENT_ID",
    clientSecret: "YOUR_CLIENT_SECRET",
    code: "AUTHORIZATION_CODE_FROM_CALLBACK",
    redirectUri: "https://your_redirect_url",
    tokenStore: tokenStore
  }),
});
```

### Migration Guide

To migrate from an older version to 0.0.30:

1. **Update imports**:
   ```typescript theme={null}
   // Old
   import { FathomApi } from 'fathom-typescript';

   // New
   import { Fathom } from 'fathom-typescript';
   ```

2. **Update client initialization**:
   ```typescript theme={null}
   // Old
   const fathom = new FathomApi("your_api_key");

   // New
   const fathom = new Fathom({
     security: {
       apiKeyAuth: "your_api_key"
     }
   });
   ```

3. **Update method calls** (if any method signatures changed):
   ```typescript theme={null}
   // Method calls remain the same
   const result = await fathom.listMeetings({});
   ```

### Backward Compatibility

<Note>Older versions of the SDK continue to work with API key authentication, but they don't support OAuth features.</Note>

If you need to maintain compatibility with older code while adding OAuth support, you can:

1. **Pin to the old version** for existing applications
2. **Create a new integration** using version 0.0.30 for OAuth features
3. **Gradually migrate** existing code to the new syntax

### Version Pinning

We recommend pinning to a specific version to avoid unexpected breaking changes:

```json theme={null}
{
  "dependencies": {
    "fathom-typescript": "0.0.30"
  }
}
```

### What's New in 0.0.30

* ✅ OAuth 2.0 support
* ✅ Improved security model
* ✅ Better TypeScript types
* ✅ Enhanced error handling
* ✅ Standalone functions for bundle optimization
* ✅ Async iteration for pagination

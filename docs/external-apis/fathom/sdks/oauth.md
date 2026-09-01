> ## Documentation Index
> Fetch the complete documentation index at: https://developers.fathom.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# OAuth

> Use OAuth authentication with the Fathom SDKs

## OAuth Authentication

<Note>
  OAuth users need to register an app with us before using this feature. Visit our [OAuth Setup Guide](/oauth) to get your client credentials and configure your redirect URL.
</Note>

Both TypeScript and Python SDKs support OAuth 2.0 authentication for building integrations that can be installed by multiple Fathom accounts.

***

### Step 1: Get Authorization URL

Using the `Client ID` and `Client Secret` you received when registering your app, generate an authorization URL that users will visit to grant your app access:

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  const url = Fathom.getAuthorizationUrl({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    redirectUri: 'https://your_redirect_url',
    scope: 'public_api',
    state: 'randomState123',
  });

  // Redirect user to this URL
  console.log(url);
  ```

  ```python Python theme={null}
  from fathom_python import Fathom

  url = Fathom.get_authorization_url(
      "YOUR_CLIENT_ID",  # client ID
      "your_redirect_url",
      "public_api",      # required scope
      "randomState123"
  )
  print(url)
  ```
</CodeGroup>

### Step 2: Handle OAuth Callback

After the user authorizes your app, they'll be redirected back to your redirect URI with an authorization code. Use this code to exchange it for access tokens:

<CodeGroup>
  ```typescript TypeScript theme={null}
  import { Fathom } from 'fathom-typescript';

  // User gets redirected here with code

  const tokenStore = Fathom.newTokenStore();  // demo only — use persistent store in production

  const fathom = new Fathom({
    security: Fathom.withAuthorization({
      clientId: "YOUR_CLIENT_ID",
      clientSecret: "YOUR_CLIENT_SECRET",
      code: "AUTHORIZATION_CODE_FROM_CALLBACK",
      redirectUri: "https://your_redirect_url",
      tokenStore
    }),
  });

  // Now you can make requests and the SDK will refresh tokens as needed
  const result = await fathom.listMeetings({});
  ```

  ```python Python theme={null}
  from fathom_python import Fathom

  # User gets redirected back to your redirect URI with a code

  token_store = Fathom.new_token_store()  # demo only — use persistent store in production

  fathom = Fathom(security=Fathom.with_authorization(
      "YOUR_CLIENT_ID",                # client_id
      "YOUR_CLIENT_SECRET",            # client_secret
      "AUTHORIZATION_CODE_FROM_CALLBACK",  # code
      "your_redirect_uri",
      token_store
  ))

  result = fathom.list_meetings()
  print(result)
  ```
</CodeGroup>

<Note>
  newTokenStore() is an in-memory store — great for demos and quick starts. For production, you'll want a persistent TokenStore so users only need to install once.
</Note>

### Step 3: Token Management & Persistence

For production, you'll want to implement your own `TokenStore` that persists tokens to a database, cache, or file.

The SDK will automatically call your `set()` when new tokens are issued, and `get()` when it needs to reuse or refresh them.

#### Example: Python persistent store (SQLite)

<Note>
  This SQLite example is meant as a simple demo. In production, you’ll want to plug in whatever storage makes sense for your stack (e.g. Postgres, Redis, cloud secret store).
</Note>

```python theme={null}
import sqlite3

from fathom_python import Fathom

class SQLiteTokenStore(Fathom.TokenStore):
    def __init__(self, db_path="tokens.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
          CREATE TABLE IF NOT EXISTS fathom_tokens (
            id INTEGER PRIMARY KEY,
            token TEXT,
            refresh_token TEXT,
            expires INTEGER
          )
        """)
        conn.commit()
        conn.close()

    def get(self):
        conn = sqlite3.connect(self.db_path)
        row = conn.execute("SELECT token, refresh_token, expires FROM fathom_tokens WHERE id = 1").fetchone()
        conn.close()
        return {"token": row[0], "refresh_token": row[1], "expires": row[2]} if row else None

    def set(self, token, refresh_token, expires):
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
          INSERT INTO fathom_tokens (id, token, refresh_token, expires)
          VALUES (1, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET token=excluded.token,
                                        refresh_token=excluded.refresh_token,
                                        expires=excluded.expires
        """, (token, refresh_token, expires))
        conn.commit()
        conn.close()
```

**Usage:**

```python theme={null}
token_store = SQLiteTokenStore()
fathom = Fathom(security=Fathom.with_authorization(
    client_id,
    client_secret,
    authorization_code,
    redirect_uri,
    token_store
))
```

#### Further examples

For a real-world production example, see [how Pylon implemented OAuth and token storage](/inspiration/pylon) as part of their Fathom integration.

### Common Mistakes

* **Calling `tokenStore.get()` too early**
  Nothing will be there yet — tokens are only written after the SDK exchanges the authorization code.

* **Assuming tokens never expire**
  Access tokens are short-lived. Always persist the refresh token and let the SDK refresh automatically.

* **Using `newTokenStore()` in production**
  It’s an in-memory store for demos only. Use a persistent store (database, Redis, file, etc.) so tokens survive restarts.

### Manual Token Exchange (Optional)

If you prefer to handle the token exchange yourself (or to debug), you can call the OAuth token endpoint directly.

<Note>The SDK handles token exchange and refresh automatically. You only need this section if you’re debugging or implementing your own flow.</Note>

**Exchange authorization code for tokens:**

```bash theme={null}
curl -X POST https://api.fathom.ai/external/v1/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTH_CODE" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "redirect_uri=YOUR_REDIRECT_URI"
```

This returns a JSON object with both an `access_token` and a `refresh_token`.

**Refresh an expired access token:**

```bash theme={null}

curl -X POST https://api.fathom.ai/external/v1/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET"
```

This also returns a JSON object with both an `access_token` and a `refresh_token`. Use the new `access_token` in API requests. Store and use the new `refresh_token` the next time your access token expires. A `refresh_token` can only be used once. If it is unused, it stays valid until the user revokes access.

### OAuth Handler Examples

Complete OAuth flow implementations for web frameworks:

<CodeGroup>
  ```typescript Express.js theme={null}
  import express from 'express';
  import { Fathom } from 'fathom-typescript';

  const app = express();

  // OAuth initiation endpoint
  app.get('/auth/fathom', (req, res) => {
    const authUrl = Fathom.getAuthorizationUrl({
      clientId: process.env.FATHOM_CLIENT_ID!,
      clientSecret: process.env.FATHOM_CLIENT_SECRET!,
      redirectUri: 'https://your-app.com/auth/fathom/callback',
      scope: 'public_api',
      state: 'random_state_string',
    });

    res.redirect(authUrl);
  });

  // OAuth callback endpoint
  app.get('/auth/fathom/callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).send('Authorization code required');
    }

    try {
      const tokenStore = Fathom.newTokenStore();
      const fathom = new Fathom({
        security: Fathom.withAuthorization({
          clientId: process.env.FATHOM_CLIENT_ID!,
          clientSecret: process.env.FATHOM_CLIENT_SECRET!,
          code,
          redirectUri: 'https://your-app.com/auth/fathom/callback',
          tokenStore
        }),
      });

      // Test the connection
      const meetings = await fathom.listMeetings({});
      res.json({ success: true, meetingsCount: meetings.items?.length || 0 });
    } catch (error) {
      console.error('OAuth error:', error);
      res.status(500).send('OAuth authentication failed');
    }
  });

  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
  ```

  ```python Flask theme={null}
  from flask import Flask, request, redirect, jsonify
  from fathom_python import Fathom
  import os

  app = Flask(__name__)

  # OAuth initiation endpoint
  @app.route('/auth/fathom')
  def auth_fathom():
      auth_url = Fathom.get_authorization_url(
          os.getenv('FATHOM_CLIENT_ID'),
          'https://your-app.com/auth/fathom/callback',
          'public_api',
          'random_state_string'
      )
      return redirect(auth_url)

  # OAuth callback endpoint
  @app.route('/auth/fathom/callback')
  def auth_fathom_callback():
      code = request.args.get('code')
      state = request.args.get('state')

      if not code:
          return 'Authorization code required', 400

      try:
          token_store = Fathom.new_token_store()
          fathom = Fathom(security=Fathom.with_authorization(
              os.getenv('FATHOM_CLIENT_ID'),
              os.getenv('FATHOM_CLIENT_SECRET'),
              code,
              'https://your-app.com/auth/fathom/callback',
              token_store
          ))

          # Test the connection
          meetings = fathom.list_meetings()
          return jsonify({
              'success': True,
              'meetingsCount': len(meetings.items) if meetings.items else 0
          })
      except Exception as e:
          print(f'OAuth error: {e}')
          return 'OAuth authentication failed', 500

  if __name__ == '__main__':
      app.run(port=3000)
  ```
</CodeGroup>

### OAuth Scopes

Currently, the only available scope is:

* `public_api` — Access to the Fathom API

### OAuth Rate limits

60 requests per 60 seconds per OAuth app for the `https://api.fathom.ai/external/v1/oauth2/token` endpoint

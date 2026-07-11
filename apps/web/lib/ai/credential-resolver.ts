import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { decrypt, encrypt } from "@/lib/security/encryption";
import type {
  ClaudeCredentialMode,
  ClaudeCredentialSource,
  OrgCredentialState,
  ResolvedCredential,
} from "@/lib/ai/credential-types";
import { noAiCredentialsError } from "@/lib/ai/anthropic-auth-errors";
import {
  probeOAuthTokenRequest,
  shouldRunOAuthProbe,
} from "@/lib/ai/oauth-probe";

type CachedCredential = {
  apiKey?: string;
  oauthToken?: string;
  source: ClaudeCredentialSource;
  mode: ClaudeCredentialMode;
  cachedAt: number;
};

const credentialCache = new Map<string, CachedCredential>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getGlobalClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;
  return new Anthropic({ apiKey: key });
}

export function isAnthropicOAuthConfigured(): boolean {
  return Boolean(
    process.env.ANTHROPIC_OAUTH_CLIENT_ID?.trim() &&
      process.env.ANTHROPIC_OAUTH_CLIENT_SECRET?.trim() &&
      process.env.ANTHROPIC_OAUTH_REDIRECT_URI?.trim()
  );
}

export function invalidateOrgCredentialCache(organizationId: string): void {
  credentialCache.delete(organizationId);
}

/** @deprecated Usar invalidateOrgCredentialCache */
export function invalidateOrgKeyCache(organizationId: string): void {
  invalidateOrgCredentialCache(organizationId);
}

function createClientFromCredential(
  source: ClaudeCredentialSource,
  secret: string
): Anthropic {
  if (source === "oauth") {
    return new Anthropic({ authToken: secret });
  }
  return new Anthropic({ apiKey: secret });
}

type OrgCredentialRow = {
  claude_api_key_encrypted: string | null;
  claude_api_key_status: string | null;
  claude_oauth_token_encrypted: string | null;
  claude_credential_mode: ClaudeCredentialMode | null;
  claude_oauth_failed_at: string | null;
  claude_oauth_last_probe_at: string | null;
  claude_oauth_last_success_at: string | null;
};

export async function loadOrgCredentialState(
  organizationId: string
): Promise<OrgCredentialState> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select(
      "claude_api_key_encrypted, claude_api_key_status, claude_oauth_token_encrypted, claude_credential_mode, claude_oauth_failed_at, claude_oauth_last_probe_at, claude_oauth_last_success_at"
    )
    .eq("id", organizationId)
    .maybeSingle();

  const row = data as OrgCredentialRow | null;

  return {
    organizationId,
    mode: row?.claude_credential_mode ?? "api_key_active",
    hasOAuth: Boolean(row?.claude_oauth_token_encrypted),
    hasApiKey: Boolean(row?.claude_api_key_encrypted),
    apiKeyStatus:
      (row?.claude_api_key_status as OrgCredentialState["apiKeyStatus"]) ??
      "none",
    oauthFailedAt: row?.claude_oauth_failed_at ?? null,
    oauthLastProbeAt: row?.claude_oauth_last_probe_at ?? null,
    oauthLastSuccessAt: row?.claude_oauth_last_success_at ?? null,
  };
}

async function loadOrgCredentialRow(
  organizationId: string
): Promise<OrgCredentialRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select(
      "claude_api_key_encrypted, claude_api_key_status, claude_oauth_token_encrypted, claude_credential_mode, claude_oauth_failed_at, claude_oauth_last_probe_at, claude_oauth_last_success_at"
    )
    .eq("id", organizationId)
    .maybeSingle();

  return (data as OrgCredentialRow | null) ?? null;
}

function decryptApiKeyIfValid(row: OrgCredentialRow): string | null {
  if (
    !row.claude_api_key_encrypted ||
    (row.claude_api_key_status !== "valid" &&
      row.claude_api_key_status !== "valid_no_credits")
  ) {
    return null;
  }

  try {
    return decrypt(row.claude_api_key_encrypted);
  } catch {
    console.warn(
      "[credential-resolver] No se pudo descifrar API key para org"
    );
    return null;
  }
}

function decryptOAuthToken(row: OrgCredentialRow): string | null {
  if (!row.claude_oauth_token_encrypted) return null;
  try {
    return decrypt(row.claude_oauth_token_encrypted);
  } catch {
    console.warn(
      "[credential-resolver] No se pudo descifrar OAuth token para org"
    );
    return null;
  }
}

export async function readOAuthTokenForOrg(
  organizationId: string
): Promise<string | null> {
  const row = await loadOrgCredentialRow(organizationId);
  if (!row) return null;
  return decryptOAuthToken(row);
}

async function runOAuthProbeIfDue(
  organizationId: string,
  lastProbeAt: string | null
): Promise<void> {
  if (!shouldRunOAuthProbe(lastProbeAt)) return;

  await touchOAuthProbeTimestamp(organizationId);

  const row = await loadOrgCredentialRow(organizationId);
  if (!row) return;

  const token = decryptOAuthToken(row);
  if (!token) return;

  const ok = await probeOAuthTokenRequest(token);
  if (ok) {
    await markOAuthActive(organizationId);
  }
}

async function touchOAuthProbeTimestamp(organizationId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase
    .from("organizations")
    .update({ claude_oauth_last_probe_at: new Date().toISOString() })
    .eq("id", organizationId);
  invalidateOrgCredentialCache(organizationId);
}

export async function markOAuthDegraded(organizationId: string): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  await supabase
    .from("organizations")
    .update({
      claude_credential_mode: "oauth_degraded",
      claude_oauth_failed_at: now,
    })
    .eq("id", organizationId);
  invalidateOrgCredentialCache(organizationId);
}

export async function markOAuthActive(organizationId: string): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  await supabase
    .from("organizations")
    .update({
      claude_credential_mode: "oauth_active",
      claude_oauth_failed_at: null,
      claude_oauth_last_success_at: now,
      claude_oauth_last_probe_at: now,
    })
    .eq("id", organizationId);
  invalidateOrgCredentialCache(organizationId);
}

export async function saveOAuthTokensForOrg(
  organizationId: string,
  tokens: {
    accessToken: string;
    refreshToken?: string | null;
    expiresAt?: string | null;
  }
): Promise<void> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  await supabase
    .from("organizations")
    .update({
      claude_oauth_token_encrypted: encrypt(tokens.accessToken),
      claude_oauth_refresh_token_encrypted: tokens.refreshToken
        ? encrypt(tokens.refreshToken)
        : null,
      claude_oauth_token_expires_at: tokens.expiresAt ?? null,
      claude_credential_mode: "oauth_active",
      claude_oauth_failed_at: null,
      claude_oauth_last_success_at: now,
    })
    .eq("id", organizationId);
  invalidateOrgCredentialCache(organizationId);
}

export async function removeOAuthForOrg(organizationId: string): Promise<void> {
  const row = await loadOrgCredentialRow(organizationId);
  const hasApiKey =
    row?.claude_api_key_encrypted &&
    (row.claude_api_key_status === "valid" ||
      row.claude_api_key_status === "valid_no_credits");

  const supabase = createAdminClient();
  await supabase
    .from("organizations")
    .update({
      claude_oauth_token_encrypted: null,
      claude_oauth_refresh_token_encrypted: null,
      claude_oauth_token_expires_at: null,
      claude_credential_mode: hasApiKey ? "api_key_active" : "api_key_active",
      claude_oauth_failed_at: null,
    })
    .eq("id", organizationId);
  invalidateOrgCredentialCache(organizationId);
}

type Resolution = {
  client: Anthropic | null;
  source: ClaudeCredentialSource | "none";
  mode: ClaudeCredentialMode;
  usedOAuth: boolean;
};

async function resolveFromRow(
  row: OrgCredentialRow,
  preferOAuth: boolean
): Promise<Resolution> {
  const mode = row.claude_credential_mode ?? "api_key_active";
  const apiKey = decryptApiKeyIfValid(row);
  const oauthToken = decryptOAuthToken(row);

  if (preferOAuth && oauthToken && mode === "oauth_active") {
    return {
      client: createClientFromCredential("oauth", oauthToken),
      source: "oauth",
      mode,
      usedOAuth: true,
    };
  }

  if (apiKey) {
    return {
      client: createClientFromCredential("api_key", apiKey),
      source: "api_key",
      mode,
      usedOAuth: false,
    };
  }

  if (oauthToken && mode === "oauth_active") {
    return {
      client: createClientFromCredential("oauth", oauthToken),
      source: "oauth",
      mode,
      usedOAuth: true,
    };
  }

  const globalClient = getGlobalClient();
  return {
    client: globalClient,
    source: globalClient ? "global" : "none",
    mode,
    usedOAuth: false,
  };
}

/**
 * Resuelve la credencial activa para una organización.
 * - oauth_active → OAuth token
 * - oauth_degraded / api_key_active → API key
 * - fallback global si no hay credenciales de org
 */
export async function resolveCredentialForOrg(
  organizationId?: string
): Promise<Resolution> {
  if (!organizationId) {
    const client = getGlobalClient();
    return {
      client,
      source: client ? "global" : "none",
      mode: "api_key_active",
      usedOAuth: false,
    };
  }

  const cached = credentialCache.get(organizationId);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    const secret = cached.oauthToken ?? cached.apiKey;
    if (!secret) {
      return {
        client: null,
        source: "none",
        mode: cached.mode,
        usedOAuth: cached.source === "oauth",
      };
    }
    return {
      client: createClientFromCredential(cached.source, secret),
      source: cached.source,
      mode: cached.mode,
      usedOAuth: cached.source === "oauth",
    };
  }

  const row = await loadOrgCredentialRow(organizationId);
  if (!row) {
    const client = getGlobalClient();
    return {
      client,
      source: client ? "global" : "none",
      mode: "api_key_active",
      usedOAuth: false,
    };
  }

  const mode = row.claude_credential_mode ?? "api_key_active";

  if (mode === "oauth_degraded") {
    void runOAuthProbeIfDue(organizationId, row.claude_oauth_last_probe_at);
  }

  const preferOAuth = mode === "oauth_active";
  const resolution = await resolveFromRow(row, preferOAuth);

  if (
    resolution.client &&
    resolution.source !== "none" &&
    resolution.source !== "global"
  ) {
    const cacheEntry: CachedCredential = {
      source: resolution.source,
      mode: resolution.mode,
      cachedAt: Date.now(),
    };
    if (resolution.source === "oauth") {
      const token = decryptOAuthToken(row);
      if (token) cacheEntry.oauthToken = token;
    } else if (resolution.source === "api_key") {
      const key = decryptApiKeyIfValid(row);
      if (key) cacheEntry.apiKey = key;
    }
    credentialCache.set(organizationId, cacheEntry);
  }

  return resolution;
}

/** Resuelve credencial de respaldo (API key) tras fallo de OAuth. */
export async function resolveFallbackApiKeyForOrg(
  organizationId: string
): Promise<Anthropic | null> {
  const row = await loadOrgCredentialRow(organizationId);
  if (!row) return getGlobalClient();

  const apiKey = decryptApiKeyIfValid(row);
  if (apiKey) {
    return createClientFromCredential("api_key", apiKey);
  }

  return getGlobalClient();
}

export async function getClientForOrg(
  organizationId?: string
): Promise<Anthropic | null> {
  const { client } = await resolveCredentialForOrg(organizationId);
  return client;
}

export async function requireCredentialForOrg(
  organizationId: string
): Promise<ResolvedCredential> {
  const resolution = await resolveCredentialForOrg(organizationId);
  if (!resolution.client || resolution.source === "none") {
    throw noAiCredentialsError();
  }
  return {
    client: resolution.client,
    source: resolution.source,
    mode: resolution.mode,
  };
}

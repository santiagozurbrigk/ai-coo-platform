import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type RateLimitEntry = { count: number; resetAt: number };

/** Fallback para desarrollo local sin Supabase. No sirve en serverless. */
const inMemoryCounters = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

function consumeInMemory(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = inMemoryCounters.get(identifier);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs;
    inMemoryCounters.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Contador compartido en Postgres (`consume_rate_limit`), para que el límite
 * valga entre instancias serverless y sobreviva a los cold starts.
 */
export function rateLimit(config: RateLimitConfig) {
  return async function checkRateLimit(
    identifier: string
  ): Promise<RateLimitResult> {
    if (!isSupabaseConfigured()) {
      return consumeInMemory(identifier, config);
    }

    try {
      const { data, error } = await createAdminClient()
        .rpc("consume_rate_limit", {
          p_key: identifier,
          p_window_ms: config.windowMs,
          p_max_requests: config.maxRequests,
        })
        .single<{ allowed: boolean; remaining: number; reset_at: string }>();

      if (error || !data) {
        throw new Error(error?.message ?? "consume_rate_limit sin respuesta");
      }

      return {
        allowed: data.allowed,
        remaining: data.remaining,
        resetAt: new Date(data.reset_at).getTime(),
      };
    } catch (err) {
      // Fail-open: un problema de infraestructura no debe cortar el tráfico
      // legítimo. Queda el contador local de la instancia como red mínima.
      console.error("[rateLimit] fallback en memoria:", err);
      return consumeInMemory(identifier, config);
    }
  };
}

export function rateLimitExceeded(resetAt: number) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    {
      error: "Demasiadas solicitudes. Intentá de nuevo en unos minutos.",
      retryAfter,
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}

export function rateLimitErrorMessage(resetAt: number): string {
  const seconds = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return `Demasiadas solicitudes. Intentá de nuevo en ${seconds} segundos.`;
}

/** Endpoints de IA — costo alto */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
});

/** Auth — brute force */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
});

/** Integraciones — sync manual */
export const integrationRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 30,
});

/** API general autenticada */
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 60,
});

/** Webhooks externos */
export const webhookRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
});

/** Webhook Unipile — sin auth de header (dashboard no lo soporta) */
export const unipileWebhookRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 40,
});

/** Conectar integración (por usuario) */
export const integrationConnectRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 5,
});

/** Generación de SOPs vía agente (por org) */
export const sopGenerateRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 3,
});

export function getRequestIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

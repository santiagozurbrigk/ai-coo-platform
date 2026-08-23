import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { withSentryConfig } from "@sentry/nextjs";
import { sectionRedirects } from "./lib/navigation/redirects";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo root — prevents Next from picking wrong workspace (e.g. user home lockfile). */
const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@ai-coo/ui", "@ai-coo/types"],
  experimental: {
    serverActions: {
      // Adjuntos de la bandeja de ventas (Unipile permite hasta 15MB).
      bodySizeLimit: "16mb",
    },
  },
  outputFileTracingRoot: monorepoRoot,
  serverExternalPackages: [
    "fluent-ffmpeg",
    "@ffmpeg-installer/ffmpeg",
    "ffprobe-static",
  ],
  turbopack: {
    root: monorepoRoot,
  },
  async redirects() {
    return [
      ...sectionRedirects.map(({ source, destination }) => ({
        source,
        destination,
        permanent: false,
      })),
      // URI legacy en Google Cloud / envs viejos (sin /oauth/)
      {
        source: "/api/integrations/google-forms/callback",
        destination: "/api/integrations/google-forms/oauth/callback",
        permanent: false,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // DSN se lee de NEXT_PUBLIC_SENTRY_DSN / SENTRY_DSN en runtime.
  // Si no está seteado, Sentry queda silencioso (no rompe el build).
  silent: true,

  // Subir source maps solo si SENTRY_AUTH_TOKEN está configurado.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Tree-shaking de las integraciones que no usamos en el browser.
  disableLogger: true,

  // No bloquear el build si Sentry no está configurado.
  hideSourceMaps: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});

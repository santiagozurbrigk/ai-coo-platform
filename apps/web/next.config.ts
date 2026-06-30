import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { sectionRedirects } from "./lib/navigation/redirects";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Monorepo root — prevents Next from picking wrong workspace (e.g. user home lockfile). */
const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  transpilePackages: ["@ai-coo/ui", "@ai-coo/types"],
  outputFileTracingRoot: monorepoRoot,
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

export default nextConfig;

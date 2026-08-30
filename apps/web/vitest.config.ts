import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Configuración de tests unitarios de `@ai-coo/web`.
 *
 * Se corre con `pnpm test` (o `turbo test` desde la raíz del monorepo).
 * Entorno Node: estos tests cubren lógica pura de `lib/`, no componentes.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "lib/**/__tests__/**/*.test.ts"],
    globals: false,
  },
});

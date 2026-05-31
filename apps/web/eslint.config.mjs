import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/components/shared",
              message:
                "No uses el barrel index de shared. Importa @/components/shared/<archivo> o @/components/shared/client para módulos cliente.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/components/shared",
              message:
                "En app router importa @/components/shared/<archivo>, no el barrel index.",
            },
            {
              name: "@/components/marketing-insights",
              message:
                "En pages/layouts importa el componente por archivo (ej. marketing-dashboard), no el barrel del módulo.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["components/charts/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;

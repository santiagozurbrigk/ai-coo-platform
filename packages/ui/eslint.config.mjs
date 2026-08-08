import globals from "globals";
import base from "@ai-coo/config/eslint/base";

export default [
  ...base,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, React: "readonly" },
    },
  },
];

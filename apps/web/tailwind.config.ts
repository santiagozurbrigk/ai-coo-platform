import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import preset from "@ai-coo/config/tailwind";

const config: Config = {
  darkMode: "class",
  presets: [preset as Config],
  plugins: [typography],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./layouts/**/*.{ts,tsx}",
    // `lib/` y `constants/` también arman clases (colores de área y prioridad
    // del workboard, etiquetas de conversación, bandas de salud de embudos).
    // Sin estos globs Tailwind nunca las generaba y los badges salían sin
    // color, salvo que la misma clase apareciera por casualidad en otro lado.
    "./lib/**/*.{ts,tsx}",
    "./constants/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "20px",
      },
      backgroundColor: {
        /* F — superficies dark visibles (Whop: gray-2 @ 82%, jerarquía 3 capas) */
        glass: "rgba(26, 26, 26, 0.82)",
        "glass-hover": "rgba(34, 34, 34, 0.86)",
        "glass-elevated": "rgba(38, 38, 38, 0.90)",
      },
      borderColor: {
        glass: "rgba(255, 255, 255, 0.08)",
        "glass-strong": "rgba(255, 255, 255, 0.14)",
      },
      keyframes: {
        "btn-press": {
          "0%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(225, 93, 18, 0)",
          },
          "40%": {
            transform: "scale(0.96)",
            boxShadow: "0 0 0 4px rgba(225, 93, 18, 0.2)",
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(225, 93, 18, 0)",
          },
        },
        "btn-press-ghost": {
          "0%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
          },
          "40%": {
            transform: "scale(0.96)",
            boxShadow: "0 0 0 4px rgba(255, 255, 255, 0.08)",
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(255, 255, 255, 0)",
          },
        },
      },
      animation: {
        "btn-press": "btn-press 0.3s ease-out",
        "btn-press-ghost": "btn-press-ghost 0.3s ease-out",
      },
    },
  },
};

export default config;

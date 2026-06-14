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
        glass: "rgba(255, 255, 255, 0.03)",
        "glass-hover": "rgba(255, 255, 255, 0.05)",
        "glass-elevated": "rgba(255, 255, 255, 0.06)",
      },
      borderColor: {
        glass: "rgba(255, 255, 255, 0.08)",
        "glass-strong": "rgba(255, 255, 255, 0.14)",
      },
      keyframes: {
        "btn-press": {
          "0%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(124, 58, 237, 0)",
          },
          "40%": {
            transform: "scale(0.96)",
            boxShadow: "0 0 0 4px rgba(124, 58, 237, 0.2)",
          },
          "100%": {
            transform: "scale(1)",
            boxShadow: "0 0 0 0 rgba(124, 58, 237, 0)",
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

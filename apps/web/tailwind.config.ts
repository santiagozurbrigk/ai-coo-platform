import type { Config } from "tailwindcss";
import preset from "@ai-coo/config/tailwind";

const config: Config = {
  darkMode: "class",
  presets: [preset as Config],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./layouts/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};

export default config;

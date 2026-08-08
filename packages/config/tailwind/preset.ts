import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          active: "hsl(var(--sidebar-foreground-active) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
        },
        ai: {
          DEFAULT: "hsl(var(--ai))",
          muted: "hsl(var(--ai-muted))",
          glow: "hsl(var(--ai-glow))",
        },
        surface: {
          1: "#111111",
          2: "#1A1A1A",
          3: "#222222",
          4: "#2A2A2A",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius-md))",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        page: "var(--radius-page)",
        pill: "var(--radius-pill)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
        body: ["var(--text-body-size)", { lineHeight: "var(--text-body-lh)" }],
        caption: [
          "var(--text-caption-size)",
          { lineHeight: "var(--text-caption-lh)" },
        ],
        micro: ["var(--text-micro-size)", { lineHeight: "var(--text-micro-lh)" }],
        "metric-value": [
          "var(--text-metric-value-size)",
          { lineHeight: "var(--text-metric-value-lh)" },
        ],
        title: ["var(--text-title-size)", { lineHeight: "var(--text-title-lh)" }],
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        card: "var(--shadow-card)",
        panel: "var(--shadow-panel)",
        band: "var(--shadow-band)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "dialog-overlay-show": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "dialog-overlay-hide": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "dialog-content-show": {
          from: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "translate(-50%, -50%) scale(1)",
          },
        },
        "dialog-content-hide": {
          from: {
            opacity: "1",
            transform: "translate(-50%, -50%) scale(1)",
          },
          to: {
            opacity: "0",
            transform: "translate(-50%, -48%) scale(0.95)",
          },
        },
        "dialog-content-show-reduced": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "dialog-content-hide-reduced": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "dialog-overlay-show": "dialog-overlay-show 200ms ease-out",
        "dialog-overlay-hide": "dialog-overlay-hide 150ms ease-out forwards",
        /* D — curva spring-like en aperturas, exit rápido */
        "dialog-content-show":
          "dialog-content-show 300ms cubic-bezier(0.16, 1, 0.3, 1)",
        "dialog-content-hide":
          "dialog-content-hide 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "dialog-content-show-reduced": "dialog-content-show-reduced 0ms linear",
        "dialog-content-hide-reduced": "dialog-content-hide-reduced 0ms linear forwards",
      },
    },
  },
};

export default preset;

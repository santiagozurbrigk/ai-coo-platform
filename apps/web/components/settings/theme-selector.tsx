"use client";

import { cn } from "@ai-coo/ui";
import { useTheme, type Theme } from "@/providers/theme-provider";

const options: { value: Theme; label: string; emoji: string }[] = [
  { value: "light", label: "Claro", emoji: "☀️" },
  { value: "dark", label: "Oscuro", emoji: "🌙" },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={cn(
              "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-violet-500 bg-violet-500/[0.08] text-foreground dark:border-violet-500 dark:bg-violet-500/[0.08]"
                : "border-border text-muted-foreground hover:text-foreground dark:border-white/10"
            )}
          >
            {opt.emoji} {opt.label}
          </button>
        );
      })}
    </div>
  );
}

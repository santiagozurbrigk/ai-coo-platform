"use client";

import { cn } from "@ai-coo/ui";
import { Moon, Sun } from "lucide-react";
import { useTheme, type Theme } from "@/providers/theme-provider";
import { SettingsSection } from "./settings-section";

const options: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Oscuro", icon: Moon },
];

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <SettingsSection
      title="Apariencia"
      description="Elige cómo se ve la interfaz en todo el producto"
    >
      <div className="space-y-2">
        <p className="text-sm font-medium">Tema</p>
        <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1">
          {options.map((opt) => {
            const Icon = opt.icon;
            const active = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </SettingsSection>
  );
}

"use client";

import { Check } from "lucide-react";
import { cn } from "@ai-coo/ui";

export function OptionCard({
  label,
  selected,
  onClick,
  multi = false,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full rounded-xl border px-5 py-4 text-left text-sm font-medium transition-all",
        "hover:border-primary/40 hover:bg-muted/30",
        selected
          ? "glass-liquid-subtle glass-liquid-border border-primary bg-primary/10 text-foreground shadow-[0_0_24px_hsl(var(--ai)/0.12)]"
          : "border-border/60 bg-muted/10 text-muted-foreground"
      )}
    >
      {multi && selected && (
        <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-3 w-3" />
        </span>
      )}
      {label}
    </button>
  );
}

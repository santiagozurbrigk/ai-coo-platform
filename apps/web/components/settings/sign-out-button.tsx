"use client";

import { cn } from "@ai-coo/ui";
import { signOutAction } from "@/app/auth/actions";
import { es } from "@/lib/locale/es";

export function SignOutButton({
  variant = "default",
}: {
  variant?: "default" | "danger";
}) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-[10px] px-[18px] text-[13px] font-medium transition-colors",
          variant === "danger"
            ? "border border-red-500/40 bg-transparent text-red-500 hover:bg-red-500/5"
            : "border border-input bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75 dark:hover:bg-white/[0.09]"
        )}
      >
        {es.nav.signOut}
      </button>
    </form>
  );
}

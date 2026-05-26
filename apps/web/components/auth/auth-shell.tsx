import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -15%, hsl(var(--ai) / 0.22), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 100%, hsl(var(--primary) / 0.08), transparent)",
        }}
      />
      <div className="relative z-10 w-full max-w-md animate-fade-in">{children}</div>
    </main>
  );
}

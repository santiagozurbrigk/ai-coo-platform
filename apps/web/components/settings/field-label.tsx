import type { ReactNode } from "react";

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
    >
      {children}
    </label>
  );
}

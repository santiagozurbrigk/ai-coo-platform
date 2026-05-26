"use client";

import { Input } from "@ai-coo/ui";

export function OtherTextField({
  visible,
  value,
  onChange,
  placeholder = "Especifica…",
}: {
  visible: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  if (!visible) return null;

  return (
    <Input
      className="mt-4 h-11"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
      required
    />
  );
}

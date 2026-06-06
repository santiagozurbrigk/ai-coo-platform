"use client";

import { useState } from "react";
import type { z } from "zod";

export function useValidatedInput<T>(schema: z.ZodType<T>) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (val: string) => {
    setValue(val);
    const result = schema.safeParse(val);
    setError(result.success ? null : result.error.issues[0]?.message ?? null);
  };

  const isValid = schema.safeParse(value).success;

  return { value, error, isValid, handleChange, setValue };
}

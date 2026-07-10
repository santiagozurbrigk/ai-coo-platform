"use server";

import { requireAuthContext } from "@/lib/auth/require-auth";

export async function getCurrentUserIdAction(): Promise<string> {
  const { user } = await requireAuthContext();
  return user.id;
}

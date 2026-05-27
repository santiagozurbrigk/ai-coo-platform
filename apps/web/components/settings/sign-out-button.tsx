"use client";

import { Button } from "@ai-coo/ui";
import { signOutAction } from "@/app/auth/actions";
import { es } from "@/lib/locale/es";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline">
        {es.nav.signOut}
      </Button>
    </form>
  );
}

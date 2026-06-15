"use client";

import { useActionState } from "react";
import { Badge, Button, GlassPanel, Input, Label, Text, cn } from "@ai-coo/ui";
import {
  signInSuperAdminAction,
  type AuthActionState,
} from "@/app/auth/actions";

const initialState: AuthActionState = {};

export function SuperAdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    signInSuperAdminAction,
    initialState
  );

  return (
    <GlassPanel
      className={cn("border-amber-500/20 p-8 shadow-xl shadow-amber-500/5")}
    >
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Badge
          variant="secondary"
          className="border-amber-500/30 bg-amber-500/10 text-amber-200/90"
        >
          Super Admin
        </Badge>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">Acceso interno</h1>
          <Text muted className="text-sm">
            Restringido a personal autorizado únicamente
          </Text>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@empresa.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        {state.error ? (
          <p className="text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full bg-amber-600 text-white hover:bg-amber-600/90"
          disabled={pending}
        >
          {pending ? "Ingresando…" : "Acceder al panel"}
        </Button>
      </form>
    </GlassPanel>
  );
}

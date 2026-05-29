"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button, Input, Label } from "@ai-coo/ui";
import { paths } from "@/routes";
import { createFounderAccountAction } from "@/app/super-admin/actions";
import { formatCredentialsCopyBlock } from "@/lib/email/welcome-email";
import type { CreateFounderResult } from "@/types/super-admin";

export function CreateFounderForm() {
  const [orgName, setOrgName] = useState("");
  const [founderName, setFounderName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateFounderResult | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createFounderAccountAction({
        organizationName: orgName,
        founderName,
        email,
      });
      if (!res.success) {
        setError(res.error);
        return;
      }
      setResult(res.data);
    });
  }

  async function copyCredentials() {
    if (!result) return;
    const text = formatCredentialsCopyBlock({
      organizationName: result.organizationName,
      email: result.email,
      password: result.password,
    });
    await navigator.clipboard.writeText(text);
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg space-y-6 rounded-xl border border-border/60 p-8">
        <p className="text-lg font-semibold text-emerald-600">
          ✓ Cuenta creada exitosamente
        </p>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Organización</dt>
            <dd className="font-medium">{result.organizationName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-medium">{result.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Contraseña temporal</dt>
            <dd className="font-mono font-medium">{result.password}</dd>
          </div>
        </dl>
        {!result.emailSent && result.emailError && (
          <p className="text-sm text-amber-600">
            Email no enviado: {result.emailError}. Podés copiar las credenciales
            manualmente.
          </p>
        )}
        {result.emailSent && (
          <p className="text-sm text-muted-foreground">
            Email de bienvenida enviado vía Resend.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={copyCredentials}>
            Copiar credenciales
          </Button>
          <Button asChild variant="outline">
            <Link
              href={paths.superAdmin.organizationDetail(
                result.organizationId
              )}
            >
              Ver organización
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setResult(null);
              setOrgName("");
              setFounderName("");
              setEmail("");
            }}
          >
            Crear otra cuenta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-6 rounded-xl border border-border/60 p-8"
    >
      <p className="text-sm text-muted-foreground">
        Se generará una contraseña temporal de 12 caracteres. El founder debe
        cambiarla en su primer acceso.
      </p>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="orgName">Nombre de la organización</Label>
        <Input
          id="orgName"
          required
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="founderName">Nombre del founder</Label>
        <Input
          id="founderName"
          required
          value={founderName}
          onChange={(e) => setFounderName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email del founder</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creando…" : "Crear cuenta"}
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={paths.superAdmin.organizations}>Cancelar</Link>
      </Button>
    </form>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, FormField, Input } from "@ai-coo/ui";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  acceptInvitationAction,
  completeInvitationForCurrentUserAction,
} from "@/app/team/actions";
import { createClient } from "@/lib/supabase/client";
import { paths } from "@/routes";
import type { InviteValidation } from "@/types/team";

function InviteForm({
  token,
  invite,
}: {
  token: string;
  invite: InviteValidation;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [hasSession, setHasSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    void (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setHasSession(Boolean(user));
      setCheckingSession(false);
    })();
  }, []);

  const handleSignup = () => {
    setError(null);
    startTransition(async () => {
      const result = await acceptInvitationAction({
        token,
        fullName: fullName.trim(),
        password,
      });

      if (!result.success) {
        if (result.error.includes("Iniciá sesión")) {
          setHasSession(false);
        }
        setError(result.error);
        return;
      }

      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invite.email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(paths.platform.dashboard);
      router.refresh();
    });
  };

  const handleCompleteExisting = () => {
    setError(null);
    startTransition(async () => {
      const result = await completeInvitationForCurrentUserAction(token);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push(paths.platform.dashboard);
      router.refresh();
    });
  };

  if (checkingSession) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (hasSession) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Confirmá para unirte a{" "}
          <strong className="text-foreground">{invite.orgName}</strong>.
        </p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            disabled={pending}
            onClick={handleCompleteExisting}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {pending ? "Uniendo…" : "Unirme al equipo"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link
              href={`${paths.auth.login}?next=${encodeURIComponent(`/invite?token=${token}`)}`}
            >
              Usar otra cuenta
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FormField label="Email">
        <Input value={invite.email} readOnly disabled />
      </FormField>
      <FormField label="Nombre completo" required>
        <Input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Tu nombre"
          disabled={pending}
        />
      </FormField>
      <FormField label="Contraseña" required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          disabled={pending}
          minLength={8}
        />
      </FormField>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="button"
        disabled={pending || !fullName.trim() || password.length < 8}
        onClick={handleSignup}
        className="w-full bg-violet-600 hover:bg-violet-700"
      >
        {pending ? "Creando cuenta…" : "Unirme al equipo"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          href={`${paths.auth.login}?next=${encodeURIComponent(`/invite?token=${token}`)}`}
          className="text-violet-600 dark:text-violet-400 hover:underline"
        >
          Iniciá sesión
        </Link>
      </p>
    </div>
  );
}

export function InvitePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [invite, setInvite] = useState<InviteValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Token de invitación requerido");
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        const res = await fetch(
          `/api/invite/validate?token=${encodeURIComponent(token)}`
        );
        const body = (await res.json()) as InviteValidation & { error?: string };
        if (!res.ok) {
          setError(body.error ?? "Invitación no válida");
          return;
        }
        setInvite(body);
      } catch {
        setError("No se pudo validar la invitación");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md space-y-6">
        <div>
          <h1 className="text-xl font-semibold">Unite al equipo</h1>
          {invite ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {invite.invitedBy ? `${invite.invitedBy} te invitó` : "Fuiste invitado"}{" "}
              a <strong className="text-foreground">{invite.orgName}</strong> como{" "}
              <strong className="text-foreground">{invite.role}</strong>.
            </p>
          ) : null}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : invite ? (
          <InviteForm token={token} invite={invite} />
        ) : null}
      </div>
    </AuthShell>
  );
}

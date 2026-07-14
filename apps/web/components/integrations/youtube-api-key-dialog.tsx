"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  connectYoutubeApiKeyAction,
  type YouTubeApiKeyState,
} from "@/app/youtube/actions";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ai-coo/ui";
import { es } from "@/lib/locale/es";

const initialState: YouTubeApiKeyState = {};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected?: () => void;
};

export function YoutubeApiKeyDialog({ open, onOpenChange, onConnected }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(connectYoutubeApiKeyAction, initialState);

  useEffect(() => {
    if (!state.success) return;
    onConnected?.();
    onOpenChange(false);
    const t = window.setTimeout(() => router.refresh(), 300);
    return () => window.clearTimeout(t);
  }, [state.success, onConnected, onOpenChange, router]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Conectar YouTube</DialogTitle>
          <DialogDescription>
            Necesitás una API key de YouTube Data API v3 y el ID de tu canal. Esto nos permite
            leer estadísticas de tus videos sin necesidad de OAuth.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="yt-api-key">API key de YouTube Data API v3</Label>
            <Input
              id="yt-api-key"
              name="apiKey"
              type="password"
              autoComplete="off"
              placeholder="AIzaSy..."
              required
            />
            <p className="text-xs text-muted-foreground">
              Creá una en{" "}
              <span className="font-medium text-foreground">Google Cloud Console → APIs &amp; Services → Credentials</span>
              {" "}con acceso a YouTube Data API v3.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="yt-channel-id">ID de canal</Label>
            <Input
              id="yt-channel-id"
              name="channelId"
              type="text"
              placeholder="UCxxxxxxxxxxxxxxxxxxxxxx"
              required
            />
            <p className="text-xs text-muted-foreground">
              Encontralo en YouTube Studio → Configuración → Información del canal → ID del canal.
            </p>
          </div>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
              {state.success}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {es.common.cancel}
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Conectando…" : es.common.connect}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

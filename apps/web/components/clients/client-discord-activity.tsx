"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Hash, MoonStar, Trophy, UserRoundX } from "lucide-react";
import { Badge, Button, GlassPanel } from "@ai-coo/ui";
import {
  createWinFromTestimonialAction,
  getClientDiscordActivityAction,
} from "@/app/discord/actions";
import { useToast } from "@/providers/toast-provider";
import {
  describeActivity,
  summarizeClientActivity,
} from "@/lib/discord/activity";
import { formatRelativeTime } from "@/lib/format";
import { IntegrationLogo } from "@/components/integrations/integration-logo";
import type { DiscordClientLink, DiscordMessage } from "@/types/discord";

export function ClientDiscordActivity({ clientId }: { clientId: string }) {
  const { push } = useToast();
  const [link, setLink] = useState<DiscordClientLink | null>(null);
  const [messages, setMessages] = useState<DiscordMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  /** Testimonios ya convertidos en esta pantalla, para no ofrecerlo dos veces. */
  const [converted, setConverted] = useState<Set<string>>(new Set());

  useEffect(() => {
    getClientDiscordActivityAction(clientId)
      .then((data) => {
        setLink(data.link);
        setMessages(data.messages);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) return null;
  if (!link && messages.length === 0) return null;

  // ⭐ D2 · La señal que importa no es cuánto habla, sino hace cuánto que no.
  const activity = summarizeClientActivity(
    messages.map((message) => ({
      sentAt: message.sent_at,
      isTestimonial: message.is_testimonial,
      attributedBy: message.attributed_by,
    }))
  );

  function convertToWin(messageId: string) {
    startTransition(async () => {
      const result = await createWinFromTestimonialAction(messageId);
      if (!result.success) {
        push({ title: "No se pudo crear el win", description: result.error });
        return;
      }
      setConverted((current) => new Set(current).add(messageId));
      push({ title: "Win creado desde el testimonio", variant: "success" });
    });
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Actividad en Discord</h2>
      <GlassPanel className="p-5 space-y-4">
        {/*
          ⭐ Se muestra también cuando el silencio NO se puede medir.
          Ese caso —hay mensajes en su canal pero nadie vinculado que los haya
          escrito— antes caía en `neverSpoke` y la franja desaparecía entera:
          la pantalla quedaba muda justo cuando tenía algo accionable que decir.
        */}
        {!activity.neverSpoke || !activity.silenceMeasurable ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={
                activity.isSilent || !activity.silenceMeasurable
                  ? "inline-flex items-center gap-1.5 rounded-full border border-warning/40 px-2 py-0.5 text-warning"
                  : "inline-flex items-center gap-1.5 text-muted-foreground"
              }
            >
              {activity.isSilent ? <MoonStar className="h-3 w-3" /> : null}
              {!activity.silenceMeasurable ? (
                <UserRoundX className="h-3 w-3" />
              ) : null}
              {describeActivity(activity)}
            </span>
            <span className="text-muted-foreground">
              · {activity.messagesLast7Days} en los últimos 7 días
            </span>
          </div>
        ) : null}

        {!activity.silenceMeasurable ? (
          <p className="text-xs text-muted-foreground">
            Hay {activity.channelMessages}{" "}
            {activity.channelMessages === 1 ? "mensaje" : "mensajes"} en su canal,
            pero ninguno lo escribió alguien asociado a esta ficha. Asociá su
            usuario de Discord desde Integraciones → Discord y el silencio pasa a
            medirse solo.
          </p>
        ) : activity.channelMessages > 0 ? (
          <p className="text-xs text-muted-foreground">
            {activity.channelMessages} de estos mensajes son de otra gente en su
            canal, así que no cuentan como que el cliente habló.
          </p>
        ) : null}
        {link && (
          <div className="flex items-center gap-3">
            <IntegrationLogo provider="discord" size="sm" />
            <div>
              <p className="text-sm font-medium">
                @{link.discord_display_name ?? link.discord_username}
              </p>
              <p className="text-xs text-muted-foreground">
                Vinculado por{" "}
                {link.link_method === "email_command"
                  ? "email"
                  : link.link_method === "manual"
                    ? "vinculación manual"
                    : "nombre"}
              </p>
            </div>
          </div>
        )}

        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Sin mensajes capturados en canales monitoreados.
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-lg border border-border/60 px-3 py-2.5"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">
                    {msg.channel_name}
                  </span>
                  {msg.is_testimonial && (
                    <Badge variant="success" className="text-[9px]">
                      Testimonio
                    </Badge>
                  )}
                  {msg.requires_attention && (
                    <Badge variant="warning" className="gap-1 text-[9px]">
                      <AlertTriangle className="h-2.5 w-2.5" />
                      Requiere atención
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(msg.sent_at)}
                </span>
              </div>
              <p className="text-xs text-foreground/80">{msg.content}</p>

              {/* ⭐ D3 · El testimonio es un candidato: lo acepta una persona. */}
              {msg.is_testimonial && !converted.has(msg.id) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1.5 h-7 gap-1.5 px-2 text-[11px]"
                  disabled={pending}
                  onClick={() => convertToWin(msg.id)}
                >
                  <Trophy className="h-3 w-3" />
                  Convertir en win
                </Button>
              ) : null}
              {converted.has(msg.id) ? (
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Ya se convirtió en un win.
                </p>
              ) : null}
            </div>
          ))
        )}
      </GlassPanel>
    </section>
  );
}

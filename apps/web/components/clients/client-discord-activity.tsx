"use client";

import { useEffect, useState } from "react";
import { Hash } from "lucide-react";
import { Badge, GlassPanel } from "@ai-coo/ui";
import { getClientDiscordActivityAction } from "@/app/discord/actions";
import { formatRelativeTime } from "@/lib/format";
import { IntegrationLogo } from "@/components/integrations/integration-logo";
import type { DiscordClientLink, DiscordMessage } from "@/types/discord";

export function ClientDiscordActivity({ clientId }: { clientId: string }) {
  const [link, setLink] = useState<DiscordClientLink | null>(null);
  const [messages, setMessages] = useState<DiscordMessage[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium">Actividad en Discord</h2>
      <GlassPanel className="p-5 space-y-4">
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
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {formatRelativeTime(msg.sent_at)}
                </span>
              </div>
              <p className="text-xs text-foreground/80">{msg.content}</p>
            </div>
          ))
        )}
      </GlassPanel>
    </section>
  );
}

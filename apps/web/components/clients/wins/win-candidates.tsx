"use client";

/**
 * ⭐ Los candidatos a win que dejó Discord.
 *
 * Es la mitad que faltaba del enganche: el clasificador marca testimonios y la
 * ficha de cada cliente los mostraba, pero de a uno. Acá están todos juntos, en
 * la pantalla donde alguien efectivamente trabaja con los wins.
 *
 * Dos botones y ninguna sorpresa: **convertir** crea el win con el mensaje como
 * origen, **descartar** corrige la marca del clasificador. Nada pasa solo.
 */

import { useEffect, useState, useTransition } from "react";
import { Button, GlassPanel } from "@ai-coo/ui";
import { MessageSquareQuote, Trophy, X } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/providers/toast-provider";
import {
  createWinFromTestimonialAction,
  dismissWinCandidateAction,
  listWinCandidatesAction,
  type WinCandidate,
} from "@/app/discord/actions";

export function WinCandidates({ onChanged }: { onChanged: () => Promise<void> }) {
  const { push } = useToast();
  const [candidates, setCandidates] = useState<WinCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    listWinCandidatesAction()
      .then(setCandidates)
      .finally(() => setLoading(false));
  }, []);

  function remove(messageId: string) {
    setCandidates((current) => current.filter((item) => item.messageId !== messageId));
  }

  function convert(candidate: WinCandidate) {
    startTransition(async () => {
      const result = await createWinFromTestimonialAction(candidate.messageId);
      if (!result.success) {
        push({ title: "No se pudo crear el win", description: result.error });
        return;
      }
      remove(candidate.messageId);
      await onChanged();
      push({ title: `Win creado para ${candidate.clientName}`, variant: "success" });
    });
  }

  function dismiss(candidate: WinCandidate) {
    startTransition(async () => {
      const result = await dismissWinCandidateAction(candidate.messageId);
      if (!result.success) {
        push({ title: "No se pudo descartar", description: result.error });
        return;
      }
      remove(candidate.messageId);
    });
  }

  if (loading) return null;

  if (candidates.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquareQuote className="h-6 w-6" />}
        title="No hay candidatos esperando"
        description="Cuando alguien cuente un resultado en el Discord de tus clientes, va a aparecer acá para que decidas si lo convertís en un win."
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Salieron de mensajes de Discord. <strong className="font-medium text-foreground">
        Ninguno es un win todavía</strong>: lo es cuando vos lo aceptás.
      </p>

      {candidates.map((candidate) => (
        <GlassPanel key={candidate.messageId} className="space-y-3 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-medium">{candidate.clientName}</span>
            <span className="text-xs text-muted-foreground">
              {candidate.channelName ? `#${candidate.channelName} · ` : ""}
              {new Date(candidate.sentAt).toLocaleDateString("es-AR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* El mensaje original, textual. Nadie acepta lo que no puede leer. */}
          <blockquote className="border-l-2 border-border pl-3 text-sm">
            {candidate.content}
          </blockquote>

          {candidate.aiSummary ? (
            <p className="text-xs text-muted-foreground">
              Resumen: {candidate.aiSummary}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button size="sm" disabled={pending} onClick={() => convert(candidate)}>
              <Trophy className="mr-1 h-3.5 w-3.5" />
              Convertir en win
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              disabled={pending}
              onClick={() => dismiss(candidate)}
            >
              <X className="mr-1 h-3.5 w-3.5" />
              No es un testimonio
            </Button>
          </div>
        </GlassPanel>
      ))}
    </div>
  );
}

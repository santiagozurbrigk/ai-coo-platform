"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getZernioPostCommentsAction,
  hideZernioCommentAction,
  replyToZernioCommentAction,
  type ZernioCommentWithAccount,
} from "@/app/integrations/zernio/actions";
import { EmptyState } from "@/components/shared/empty-state";
import { PageLoading } from "@/components/shared/page-loading";
import { Badge, Button, Card, CardContent, Input, cn } from "@ai-coo/ui";
import { useToast } from "@/providers/toast-provider";

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "bg-[#E4405F]/15 text-[#E4405F]",
  facebook: "bg-[#1877F2]/15 text-[#1877F2]",
  whatsapp: "bg-[#25D366]/15 text-[#25D366]",
};

type Props = {
  postId: string;
};

export function ZernioPostComments({ postId }: Props) {
  const { push } = useToast();
  const [comments, setComments] = useState<ZernioCommentWithAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getZernioPostCommentsAction(postId);
      setComments(list);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void loadComments();
  }, [loadComments]);

  async function handleReply(comment: ZernioCommentWithAccount) {
    if (!replyDraft.trim() || !comment.accountId) return;
    setActionId(comment._id);
    try {
      await replyToZernioCommentAction(
        comment.postId,
        comment._id,
        replyDraft.trim(),
        comment.accountId
      );
      setReplyingId(null);
      setReplyDraft("");
      await loadComments();
      push({ title: "Respuesta enviada", variant: "success" });
    } catch (err) {
      push({
        title: "No se pudo responder",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setActionId(null);
    }
  }

  async function handleHide(comment: ZernioCommentWithAccount) {
    setActionId(comment._id);
    try {
      await hideZernioCommentAction(comment.postId, comment._id);
      await loadComments();
      push({ title: "Comentario oculto", variant: "success" });
    } catch (err) {
      push({
        title: "No se pudo ocultar",
        description: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return <PageLoading label="Cargando comentarios…" />;
  }

  if (comments.length === 0) {
    return (
      <EmptyState
        title="Sin comentarios"
        description="Este post no tiene comentarios todavía."
      />
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const platformClass =
          PLATFORM_COLORS[comment.platform.toLowerCase()] ??
          "bg-muted text-muted-foreground";

        return (
          <Card key={comment._id}>
            <CardContent className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn("capitalize", platformClass)}>
                    {comment.platform}
                  </Badge>
                  <span className="text-sm font-medium">
                    {comment.author?.name ??
                      (comment.author?.username
                        ? `@${comment.author.username}`
                        : "Autor")}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString("es-AR")}
                </span>
              </div>

              <p className="text-sm text-foreground">{comment.text}</p>

              {comment.isHidden ? (
                <p className="text-xs text-muted-foreground">Oculto</p>
              ) : null}

              {replyingId === comment._id ? (
                <div className="flex gap-2">
                  <Input
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder="Tu respuesta…"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={actionId === comment._id || !replyDraft.trim()}
                    onClick={() => void handleReply(comment)}
                  >
                    Enviar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReplyingId(null);
                      setReplyDraft("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={!comment.accountId || comment.isHidden}
                    onClick={() => {
                      setReplyingId(comment._id);
                      setReplyDraft("");
                    }}
                  >
                    Responder
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={actionId === comment._id || comment.isHidden}
                    onClick={() => void handleHide(comment)}
                  >
                    Ocultar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

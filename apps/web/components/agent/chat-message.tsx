"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sparkles, User } from "lucide-react";
import { cn, usePrefersReducedMotion } from "@ai-coo/ui";
import type {
  AgentMessageActionType,
  AgentMessageAttachment,
  GraphProposal,
} from "@/types/agent";
import { ActionCard } from "./action-card";
import { ThinkingBlock } from "./thinking-block";
import { DocumentCard } from "./document-card";
import { ProposalCard } from "./proposal-card";

const assistantProseClassName =
  "prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-headings:font-medium prose-p:text-foreground/90 prose-p:my-2 prose-li:text-foreground/90 prose-strong:text-foreground prose-h1:text-base prose-h1:mt-3 prose-h1:mb-2 prose-h2:text-base prose-h2:mt-3 prose-h2:mb-1.5 prose-h3:text-sm prose-h3:mt-2 prose-h3:mb-1 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-pre:my-2 prose-code:text-foreground prose-a:text-violet-600 dark:prose-a:text-violet-400 first:prose-headings:mt-0 first:prose-p:mt-0";

export function ChatMessage({
  role,
  content,
  actionType,
  actionRefId,
  animateReveal = false,
  thinkingContent,
  attachments,
  graphProposals,
}: {
  role: "user" | "assistant";
  content: string;
  actionType?: AgentMessageActionType | null;
  actionRefId?: string | null;
  animateReveal?: boolean;
  thinkingContent?: string | null;
  attachments?: AgentMessageAttachment[] | null;
  graphProposals?: GraphProposal[] | null;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const shouldReveal = role === "assistant" && animateReveal && !reducedMotion;
  const [visibleLength, setVisibleLength] = useState(() =>
    shouldReveal ? 0 : content.length
  );

  useEffect(() => {
    if (!shouldReveal) {
      setVisibleLength(content.length);
      return;
    }

    setVisibleLength(0);
    const step = Math.max(2, Math.ceil(content.length / 160));
    const interval = window.setInterval(() => {
      setVisibleLength((current) => {
        const next = Math.min(content.length, current + step);
        if (next >= content.length) window.clearInterval(interval);
        return next;
      });
    }, 16);

    return () => window.clearInterval(interval);
  }, [content, shouldReveal]);

  const visibleContent = useMemo(
    () => (shouldReveal ? content.slice(0, visibleLength) : content),
    [content, shouldReveal, visibleLength]
  );

  return (
    <motion.div
      className={cn("flex gap-3", role === "user" && "flex-row-reverse")}
      initial={shouldReveal ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          role === "assistant"
            ? "border border-violet-500/30 bg-violet-600/20"
            : "chat-message-user-avatar border border-border bg-muted"
        )}
      >
        {role === "assistant" ? (
          <Sparkles className="h-3.5 w-3.5 text-violet-400" />
        ) : (
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <div className="flex max-w-[75%] flex-col gap-1">
        {role === "assistant" && thinkingContent ? (
          <ThinkingBlock thinkingContent={thinkingContent} />
        ) : null}
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            role === "assistant"
              ? "chat-message-assistant border text-foreground"
              : "bg-violet-600 text-white"
          )}
        >
          {role === "assistant" ? (
            <div className={assistantProseClassName}>
              <ReactMarkdown>{visibleContent}</ReactMarkdown>
            </div>
          ) : (
            content
          )}
        </div>
        {attachments && attachments.length > 0
          ? attachments.map((att, i) => (
              <DocumentCard key={i} attachment={att} />
            ))
          : null}
        {graphProposals && graphProposals.length > 0
          ? graphProposals.map((p) => (
              <ProposalCard key={p.id} proposal={p} />
            ))
          : null}
        {actionType && actionRefId && actionType !== "graph_proposals" ? (
          <ActionCard action={actionType} refId={actionRefId} />
        ) : null}
      </div>
    </motion.div>
  );
}

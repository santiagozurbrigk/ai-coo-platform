"use client";

import { useRef } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@ai-coo/ui";

export function PromptInputBox({
  value,
  onChange,
  onSend,
  placeholder = "Preguntale algo a tu agente...",
  isLoading = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
  };

  return (
    <div
      className={cn(
        "prompt-input-box floating-chat-input rounded-2xl border border-border bg-card p-3",
        className
      )}
    >
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={placeholder}
          rows={3}
          disabled={isLoading}
          className="min-h-[72px] max-h-[160px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!value.trim() || isLoading}
          aria-label="Enviar mensaje"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
            "bg-violet-600 text-white hover:bg-violet-500",
            "disabled:cursor-not-allowed disabled:opacity-40",
            "hover:scale-105 active:scale-95"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

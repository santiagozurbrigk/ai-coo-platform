"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, BrainCog } from "lucide-react";
import { cn } from "@ai-coo/ui";

type ThinkingEntry = { text: string };

interface ThinkingBlockProps {
  thinkingContent: string;
}

export function ThinkingBlock({ thinkingContent }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(false);

  let entries: ThinkingEntry[] = [];
  try {
    entries = JSON.parse(thinkingContent) as ThinkingEntry[];
  } catch {
    entries = [{ text: thinkingContent }];
  }

  const combinedText = entries.map((e) => e.text).join("\n\n");

  return (
    <div className="mb-2 rounded-xl border border-violet-500/20 bg-violet-500/5">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-violet-400 transition-colors hover:text-violet-300"
        aria-expanded={expanded}
      >
        <BrainCog className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 font-medium">Razonamiento interno</span>
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-violet-500/20 px-3 py-2">
          <p
            className={cn(
              "whitespace-pre-wrap text-xs leading-relaxed text-violet-300/70 font-mono"
            )}
          >
            {combinedText}
          </p>
        </div>
      )}
    </div>
  );
}

"use client";

import { Sparkles } from "lucide-react";

export function AgentEmptyState({
  onSuggestion,
}: {
  onSuggestion?: (text: string) => void;
}) {
  const suggestions = [
    "¿Cuál es mi tasa de agendamiento esta semana?",
    "¿Dónde están los cuellos de botella operacionales?",
    "¿Qué contenido está generando más ventas?",
    "¿Cómo mejorar el cash collected este mes?",
  ];

  return (
    <div className="empty-state flex h-full flex-col items-center justify-center gap-8 py-12">
      <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-violet-500/30 bg-violet-600/15">
        <Sparkles className="h-7 w-7 text-violet-500/70 dark:text-violet-400/80" />
      </div>
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          ¿En qué puedo ayudarte?
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tengo acceso a toda la información de tu negocio. Preguntame lo que
          necesites.
        </p>
      </div>
      <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestion?.(suggestion)}
            className="agent-suggestion rounded-xl px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

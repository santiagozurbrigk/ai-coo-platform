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
    <div className="empty-state glass-liquid-subtle flex h-full flex-col items-center justify-center gap-8 rounded-2xl border border-white/6 py-12 dark:border-white/6">
      <div className="glass-liquid-border relative z-10 mb-2 flex h-16 w-16 items-center justify-center rounded-full">
        <Sparkles className="relative z-10 h-7 w-7 text-white/40" />
      </div>
      <div className="relative z-10 space-y-2 text-center">
        <h2 className="text-xl font-semibold text-foreground">
          ¿En qué puedo ayudarte?
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tengo acceso a toda la información de tu negocio. Preguntame lo que
          necesites.
        </p>
      </div>
      <div className="relative z-10 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestion?.(suggestion)}
            className="agent-suggestion rounded-xl border px-4 py-3 text-left text-sm text-muted-foreground transition-all duration-150 hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

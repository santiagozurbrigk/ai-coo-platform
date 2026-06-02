"use client";

import { useFloatingChat } from "@/providers/floating-chat-provider";

const SUGGESTIONS = [
  "¿Cuál es mi tasa de agendamiento esta semana?",
  "¿Dónde están los cuellos de botella operacionales?",
  "¿Qué contenido está generando más ventas?",
  "¿Cómo mejorar el cash collected este mes?",
];

export function AgentEmptyState() {
  const { applySuggestion } = useFloatingChat();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 py-12">
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
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => applySuggestion(suggestion)}
            className="agent-suggestion rounded-xl border px-4 py-3 text-left text-sm text-muted-foreground transition-all duration-150 hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

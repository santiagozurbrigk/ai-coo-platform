import { GlassPanel, Text } from "@ai-coo/ui";

type ScreenPlaceholderProps = {
  title: string;
  phase?: string;
  description?: string;
};

/** Placeholder temporal de ruta — sustituido en Fase 0.6 por pantallas reales. */
export function ScreenPlaceholder({
  title,
  phase = "0.6",
  description = "Pantalla completa con datos mock en Fase 0.6.",
}: ScreenPlaceholderProps) {
  return (
    <GlassPanel className="p-8 max-w-lg">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <Text muted className="mt-2">
        {description}
      </Text>
      <p className="mt-4 text-2xs text-muted-foreground">Phase {phase}</p>
    </GlassPanel>
  );
}

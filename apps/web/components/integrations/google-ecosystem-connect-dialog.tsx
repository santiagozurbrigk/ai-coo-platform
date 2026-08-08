"use client";

import { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ai-coo/ui";
import { cn } from "@ai-coo/ui";
import { Info } from "lucide-react";
import { es } from "@/lib/locale/es";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ServiceOption = {
  id: "forms_drive" | "youtube";
  label: string;
  description: string;
};

const SERVICES: ServiceOption[] = [
  {
    id: "forms_drive",
    label: "Google Drive + Forms",
    description: "Acceso a archivos de Drive y respuestas de formularios.",
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Estadísticas de videos y datos del canal.",
  },
];

export function GoogleEcosystemConnectDialog({ open, onOpenChange }: Props) {
  const [selected, setSelected] = useState<Set<"forms_drive" | "youtube">>(
    new Set(["forms_drive", "youtube"])
  );

  const toggle = (id: "forms_drive" | "youtube") => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConnect = () => {
    const includeYoutube = selected.has("youtube") ? "1" : "0";
    window.location.href = `/api/integrations/google-forms/oauth/start?youtube=${includeYoutube}`;
  };

  const youtubeDeselected = !selected.has("youtube");
  const nothingSelected = selected.size === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Conectar ecosistema Google</DialogTitle>
          <DialogDescription>
            Seleccioná qué servicios de Google querés conectar con esta cuenta.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {SERVICES.map((service) => {
            const isSelected = selected.has(service.id);
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => toggle(service.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/50 bg-muted/20 opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      isSelected
                        ? "border-primary bg-primary"
                        : "border-border/60 bg-background"
                    )}
                  >
                    {isSelected && (
                      <svg
                        viewBox="0 0 10 8"
                        fill="none"
                        className="h-2.5 w-2.5"
                      >
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {service.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {youtubeDeselected && (
          <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Si tu canal de YouTube usa un email distinto al de Drive y Forms,
              conectalo por separado con la integración{" "}
              <span className="font-medium">YouTube (API key)</span> desde esta
              misma página.
            </span>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            {es.common.cancel}
          </Button>
          <Button
            type="button"
            disabled={nothingSelected}
            onClick={handleConnect}
          >
            {es.common.connect}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

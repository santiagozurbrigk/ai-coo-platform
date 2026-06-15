"use client";

import { useState } from "react";
import { Plus, Rocket } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { CreateLaunchModal } from "@/components/lanzamientos/create-launch-modal";
import { LaunchCard } from "@/components/lanzamientos/launch-card";
import type { LaunchSummary } from "@/types/launches";

export function LaunchesPageContent({
  initialLaunches,
}: {
  initialLaunches: LaunchSummary[];
}) {
  const [launches, setLaunches] = useState(initialLaunches);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lanzamientos</h1>
          <p className="text-sm text-muted-foreground">
            Planificá, ejecutá y medí el impacto de cada lanzamiento.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo lanzamiento
        </Button>
      </div>

      {launches.length === 0 ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border/60 bg-muted/10 px-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/40 bg-muted/40">
            <Rocket className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="max-w-md space-y-2">
            <h2 className="text-lg font-medium">Planificá tu primer lanzamiento</h2>
            <p className="text-sm text-muted-foreground">
              Organizá tareas, seguí el revenue y generá un post-mortem automático
              con IA cuando termine.
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Crear lanzamiento</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {launches.map((launch) => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
        </div>
      )}

      <CreateLaunchModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(launch) => setLaunches((prev) => [launch, ...prev])}
      />
    </div>
  );
}

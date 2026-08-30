"use client";

import Link from "next/link";
import { Instagram } from "lucide-react";
import { Button, GlassPanel } from "@ai-coo/ui";
import { paths } from "@/routes";

export function InstagramEmptyState() {
  return (
    <GlassPanel className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/20 to-brand-500/20 text-pink-400 mb-6">
        <Instagram className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight max-w-md">
        Conectá tu Instagram para activar Marketing
      </h2>
      <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">
        Visualizá el rendimiento de todo tu contenido y descubrí qué publicaciones están
        generando conversaciones, agendamientos y ventas.
      </p>
      <Button className="mt-8" asChild>
        <Link href={paths.platform.integrations}>Conectar Instagram</Link>
      </Button>
    </GlassPanel>
  );
}

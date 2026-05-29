"use client";

import Link from "next/link";
import { Film } from "lucide-react";
import { Button, GlassPanel } from "@ai-coo/ui";
import { paths } from "@/routes";

export function ContentLibraryEmptyState() {
  return (
    <GlassPanel className="flex flex-col items-center justify-center px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground mb-6">
        <Film className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight max-w-md">
        Sin contenido sincronizado
      </h2>
      <p className="mt-3 text-sm text-muted-foreground max-w-lg leading-relaxed">
        Conectá Instagram o YouTube en Integraciones para ver tu contenido aquí.
      </p>
      <Button className="mt-8" asChild>
        <Link href={paths.platform.integrations}>Ir a Integraciones</Link>
      </Button>
    </GlassPanel>
  );
}

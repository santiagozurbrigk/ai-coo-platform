import { FolderOpen } from "lucide-react";
import { Badge, Button, GlassPanel, Text } from "@ai-coo/ui";

export function DriveSourceBanner() {
  return (
    <GlassPanel className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between" glow>
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
          <FolderOpen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Google Drive conectado</p>
            <Badge variant="success">Activo</Badge>
          </div>
          <Text muted className="mt-0.5 text-xs">
            Carpeta: Contenido / Reels · Stories · VSL — solo miniaturas en UI (videos no
            almacenados).
          </Text>
        </div>
      </div>
      <Button variant="outline" size="sm" type="button" className="shrink-0">
        Gestionar carpetas
      </Button>
    </GlassPanel>
  );
}

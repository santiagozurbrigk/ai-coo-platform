"use client";

import { Button } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";

export function SettingsFormActions({
  onSave,
  onCancel,
  isPending,
}: {
  onSave: () => void;
  onCancel: () => void;
  isPending?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-6">
      <Button type="button" onClick={onSave} disabled={isPending}>
        {isPending ? "Guardando…" : es.common.save}
      </Button>
      <Button type="button" variant="ghost" onClick={onCancel}>
        {es.common.cancel}
      </Button>
    </div>
  );
}

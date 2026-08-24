"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { syncZernioContentAction } from "@/app/marketing/content/sync-actions";

export function ContentSyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  async function handleSync() {
    setLoading(true);
    try {
      await syncZernioContentAction();
      setLastSync(new Date());
      router.refresh();
    } catch {
      // Silencioso — el usuario verá que el contenido no cambió
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
        aria-hidden
      />
      {loading
        ? "Sincronizando…"
        : lastSync
          ? `Sincronizado ${lastSync.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
          : "Sincronizar ahora"}
    </button>
  );
}

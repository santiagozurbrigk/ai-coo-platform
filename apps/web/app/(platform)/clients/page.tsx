"use client";

import { ClientsList } from "@/components/clients";
import { PageHeader } from "@/components/shared/page-header";
import { usePlatformData } from "@/providers";

export default function ClientsPage() {
  const { clients, clientsLoading } = usePlatformData();

  return (
    <div className="space-y-6">
      <PageHeader description="Seguimiento desde el cierre hasta caso de éxito" />
      {clientsLoading ? (
        <p className="text-sm text-muted-foreground">Cargando clientes…</p>
      ) : (
        <ClientsList clients={clients} />
      )}
    </div>
  );
}

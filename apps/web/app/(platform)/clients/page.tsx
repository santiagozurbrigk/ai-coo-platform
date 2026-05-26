"use client";

import { ClientsList } from "@/components/clients";
import { PageHeader } from "@/components/shared/page-header";
import { usePlatformData } from "@/providers";

export default function ClientsPage() {
  const { clients } = usePlatformData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Seguimiento desde el cierre hasta caso de éxito"
      />
      <ClientsList clients={clients} />
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@ai-coo/ui";
import { Star } from "lucide-react";
import { FilterPills } from "@/components/marketing/filter-pills";
import { paths } from "@/routes";
import type { Client, ClientStatus } from "@/types/clients";

const STATUS_LABEL: Record<ClientStatus, string> = {
  pending_onboarding: "Realizar onboarding",
  onboarding_done: "Onboarding realizado",
  active: "Activo",
  success_case: "Caso de éxito",
};

const FILTERS: { id: ClientStatus | "all"; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pending_onboarding", label: "Pendiente onboarding" },
  { id: "onboarding_done", label: "Onboarding hecho" },
  { id: "active", label: "Activos" },
  { id: "success_case", label: "Caso de éxito" },
];

const PAYMENT_LABEL = {
  upfront: "Upfront",
  installments: "Cuotas",
  upfront_fee: "Upfront + fee",
};

export function ClientsList({ clients }: { clients: Client[] }) {
  const [filter, setFilter] = useState<ClientStatus | "all">("all");
  const filtered =
    filter === "all" ? clients : clients.filter((c) => c.status === filter);

  return (
    <div className="space-y-4">
      <FilterPills
        options={FILTERS.map((f) => ({ value: f.id, label: f.label }))}
        value={filter}
        onChange={(value) => setFilter(value as ClientStatus | "all")}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Alta</th>
              <th className="px-4 py-3 font-medium">Pago</th>
              <th className="px-4 py-3 font-medium">Monto</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => (
              <tr
                key={client.id}
                className="border-b border-border/50 transition-colors hover:bg-muted/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{client.name}</span>
                    {client.isSuccessCase && (
                      <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{client.joinDate}</td>
                <td className="px-4 py-3">{PAYMENT_LABEL[client.paymentType]}</td>
                <td className="px-4 py-3 tabular-nums">
                  ${client.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{STATUS_LABEL[client.status]}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={paths.platform.clients.detail(client.id)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No hay clientes con este filtro.
          </p>
        )}
      </div>
    </div>
  );
}

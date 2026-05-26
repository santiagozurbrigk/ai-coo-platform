"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, cn } from "@ai-coo/ui";
import { Star } from "lucide-react";
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
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((client) => (
          <Link
            key={client.id}
            href={paths.platform.clients.detail(client.id)}
            className="rounded-xl border border-border bg-card/30 p-5 transition-colors hover:bg-muted/30"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold">{client.name}</p>
              {client.isSuccessCase && (
                <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Alta: {client.joinDate}
            </p>
            <p className="mt-2 text-sm">
              {PAYMENT_LABEL[client.paymentType]} · $
              {client.totalAmount.toLocaleString()}
            </p>
            <Badge className="mt-3" variant="secondary">
              {STATUS_LABEL[client.status]}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

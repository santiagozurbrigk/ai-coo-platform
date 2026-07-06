"use client";

import { useMemo, useState } from "react";
import { DataTable, Input } from "@ai-coo/ui";
import { formatOrgDateTime } from "@/lib/super-admin/format-org-datetime";
import type { WaitlistLead } from "@/types/waitlist";

function formatDate(iso: string): string {
  return formatOrgDateTime(iso, null, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function fullName(lead: WaitlistLead): string {
  const parts = [lead.firstName, lead.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : "—";
}

export function WaitlistTable({ leads }: { leads: WaitlistLead[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) => {
      return (
        lead.email.toLowerCase().includes(q) ||
        fullName(lead).toLowerCase().includes(q) ||
        (lead.phone ?? "").toLowerCase().includes(q) ||
        (lead.instagram ?? "").toLowerCase().includes(q) ||
        (lead.monthlyRevenue ?? "").toLowerCase().includes(q) ||
        (lead.operationalPain ?? "").toLowerCase().includes(q)
      );
    });
  }, [leads, search]);

  return (
    <div className="space-y-6">
      <Input
        placeholder="Buscar por email, nombre, teléfono..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <DataTable
        columns={[
          {
            key: "createdAt",
            header: "Fecha",
            cell: (lead) => formatDate(lead.createdAt),
          },
          {
            key: "name",
            header: "Nombre",
            cell: (lead) => fullName(lead),
          },
          {
            key: "email",
            header: "Email",
            cell: (lead) => lead.email,
          },
          {
            key: "phone",
            header: "Teléfono",
            cell: (lead) => lead.phone ?? "—",
          },
          {
            key: "instagram",
            header: "Instagram",
            cell: (lead) => lead.instagram ?? "—",
          },
          {
            key: "monthlyRevenue",
            header: "Facturación",
            cell: (lead) => lead.monthlyRevenue ?? "—",
          },
          {
            key: "teamSize",
            header: "Equipo",
            cell: (lead) => lead.teamSize ?? "—",
          },
          {
            key: "operationalPain",
            header: "Dolor operativo",
            cell: (lead) => (
              <span className="line-clamp-2 max-w-xs">{lead.operationalPain ?? "—"}</span>
            ),
          },
          {
            key: "whyNow",
            header: "Por qué ahora",
            cell: (lead) => (
              <span className="line-clamp-2 max-w-xs">{lead.whyNow ?? "—"}</span>
            ),
          },
          {
            key: "utmCampaign",
            header: "UTM",
            cell: (lead) => lead.utmCampaign ?? lead.utmSource ?? "—",
          },
        ]}
        data={filtered}
        emptyMessage="Todavía no hay aplicaciones en la waitlist."
        keyExtractor={(lead) => lead.id}
      />
    </div>
  );
}

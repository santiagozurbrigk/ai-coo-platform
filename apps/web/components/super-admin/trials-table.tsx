"use client";

import { useMemo, useState } from "react";
import { DataTable, Input, Badge } from "@ai-coo/ui";
import { ExternalLink } from "lucide-react";
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

function CalendlyLink({ url }: { url: string | null }) {
  if (!url) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-brand-500 underline-offset-4 hover:underline"
    >
      Ver agenda
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export function TrialsTable({ leads }: { leads: WaitlistLead[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) =>
      [lead.email, fullName(lead), lead.phone ?? "", lead.instagram ?? ""].some(
        (v) => v.toLowerCase().includes(q)
      )
    );
  }, [leads, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por email, nombre, teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
        <Badge variant="secondary">
          {filtered.length} {filtered.length === 1 ? "lead" : "leads"}
        </Badge>
      </div>

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
            cell: (lead) => (
              <a
                href={`mailto:${lead.email}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {lead.email}
              </a>
            ),
          },
          {
            key: "phone",
            header: "WhatsApp",
            cell: (lead) =>
              lead.phone ? (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                >
                  {lead.phone}
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            key: "instagram",
            header: "Instagram",
            cell: (lead) =>
              lead.instagram ? (
                <a
                  href={`https://instagram.com/${lead.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline-offset-4 hover:underline"
                >
                  {lead.instagram.startsWith("@") ? lead.instagram : `@${lead.instagram}`}
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            key: "calendlyEventUrl",
            header: "Sesión Calendly",
            cell: (lead) => <CalendlyLink url={lead.calendlyEventUrl} />,
          },
          {
            key: "utmCampaign",
            header: "UTM",
            cell: (lead) =>
              lead.utmCampaign ?? lead.utmSource ?? (
                <span className="text-muted-foreground">—</span>
              ),
          },
        ]}
        data={filtered}
        emptyMessage="Todavía no hay pruebas confirmadas."
        keyExtractor={(lead) => lead.id}
      />
    </div>
  );
}

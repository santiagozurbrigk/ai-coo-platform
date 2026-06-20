import { Badge } from "@ai-coo/ui";
import { formatOrgDate } from "@/lib/super-admin/format-org-datetime";
import type { ClientHealthTimelineItem } from "@/lib/super-admin/client-health";

const PROGRESS_LABEL: Record<string, string> = {
  improving: "↑ Mejorando",
  stable: "→ Estable",
  declining: "↓ En declive",
  unknown: "—",
};

const ENTRY_TYPE_LABEL: Record<string, string> = {
  fathom_call: "Llamada",
  manual_note: "Nota",
  status_change: "Estado",
  payment: "Pago",
  onboarding: "Onboarding",
};

function formatTimelineDate(iso: string, timezone: string | null): string {
  return formatOrgDate(iso, timezone, { day: "numeric", month: "short" });
}

function problemStatusBadge(status: string) {
  if (status === "resolved") {
    return (
      <Badge variant="secondary" className="text-[10px]">
        resuelto
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400">
      activo
    </Badge>
  );
}

export function OrgClientHealthSection({
  orgName,
  timezone,
  clients,
}: {
  orgName: string;
  timezone: string | null;
  clients: ClientHealthTimelineItem[];
}) {
  return (
    <section className="rounded-xl border border-border/60 p-6">
      <h3 className="text-sm font-semibold">
        Salud de clientes — {orgName}
      </h3>

      {clients.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Sin clientes registrados en esta organización.
        </p>
      ) : (
        <div className="mt-6 space-y-8">
          {clients.map((client) => (
            <div key={client.clientId} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{client.clientName}</p>
                {client.progressIndicator && (
                  <span className="text-sm text-muted-foreground">
                    {PROGRESS_LABEL[client.progressIndicator] ??
                      client.progressIndicator}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Problemas activos: {client.activeProblems} · Resueltos:{" "}
                {client.resolvedProblems}
              </p>

              {client.timeline.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Sin entradas en el timeline.
                </p>
              ) : (
                <ul className="space-y-2 border-l border-border/60 pl-4">
                  {client.timeline.map((entry) => (
                    <li key={entry.id} className="text-sm">
                      <span className="text-muted-foreground">
                        {formatTimelineDate(entry.createdAt, timezone)} ·{" "}
                        {ENTRY_TYPE_LABEL[entry.entryType] ?? entry.entryType} ·{" "}
                      </span>
                      <span>{entry.title}</span>
                      {entry.problems.length > 0 && (
                        <ul className="mt-1 space-y-1">
                          {entry.problems.map((p) => (
                            <li
                              key={p.description}
                              className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                            >
                              <span>&quot;{p.description}&quot;</span>
                              {problemStatusBadge(p.status)}
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

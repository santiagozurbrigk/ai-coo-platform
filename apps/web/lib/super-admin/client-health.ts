import { createAdminClient } from "@/lib/supabase/admin";

export type OrgClientHealthSummary = {
  orgId: string;
  orgName: string;
  activeClients: number;
  activeProblems: number;
  resolvedThisMonth: number;
  topProblems: { description: string; count: number }[];
};

export async function loadClientHealthOverview(): Promise<
  OrgClientHealthSummary[]
> {
  const admin = createAdminClient();
  const { data: orgs } = await admin
    .from("organizations")
    .select("id, name")
    .eq("status", "active");

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const summaries: OrgClientHealthSummary[] = [];

  for (const org of orgs ?? []) {
    const [{ count: activeClients }, { data: problems }] = await Promise.all([
      admin
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", org.id)
        .eq("status", "active"),
      admin
        .from("client_problems")
        .select("problem_description, status, resolved_at")
        .eq("organization_id", org.id),
    ]);

    const all = problems ?? [];
    const activeProblems = all.filter((p) => p.status !== "resolved").length;
    const resolvedThisMonth = all.filter(
      (p) =>
        p.status === "resolved" &&
        p.resolved_at &&
        new Date(p.resolved_at) >= monthStart
    ).length;

    const freq = new Map<string, number>();
    for (const p of all.filter((x) => x.status !== "resolved")) {
      const key = p.problem_description;
      freq.set(key, (freq.get(key) ?? 0) + 1);
    }
    const topProblems = [...freq.entries()]
      .map(([description, count]) => ({ description, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    summaries.push({
      orgId: org.id,
      orgName: org.name,
      activeClients: activeClients ?? 0,
      activeProblems,
      resolvedThisMonth,
      topProblems,
    });
  }

  return summaries;
}

export async function loadOrgClientProblems(orgId: string) {
  const admin = createAdminClient();
  const { data: clients } = await admin
    .from("clients")
    .select("id, name, status")
    .eq("organization_id", orgId);

  const result = [];
  for (const client of clients ?? []) {
    const { data: problems } = await admin
      .from("client_problems")
      .select("*")
      .eq("client_id", client.id)
      .order("detected_at", { ascending: false });

    result.push({ client, problems: problems ?? [] });
  }
  return result;
}

export type ClientHealthTimelineItem = {
  clientId: string;
  clientName: string;
  progressIndicator: string | null;
  activeProblems: number;
  resolvedProblems: number;
  timeline: {
    id: string;
    createdAt: string;
    entryType: string;
    title: string;
    problems: { description: string; status: string }[];
  }[];
};

export async function loadOrgClientHealthTimeline(
  orgId: string
): Promise<ClientHealthTimelineItem[]> {
  const admin = createAdminClient();

  const { data: clients } = await admin
    .from("clients")
    .select("id, name")
    .eq("organization_id", orgId)
    .order("name");

  const items: ClientHealthTimelineItem[] = [];

  for (const client of clients ?? []) {
    const [{ data: problems }, { data: entries }] = await Promise.all([
      admin
        .from("client_problems")
        .select("problem_description, status")
        .eq("client_id", client.id)
        .eq("organization_id", orgId),
      admin
        .from("client_timeline_entries")
        .select("id, created_at, entry_type, title, problems_detected, progress_indicator")
        .eq("client_id", client.id)
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false }),
    ]);

    const allProblems = problems ?? [];
    const activeProblems = allProblems.filter(
      (p) => p.status !== "resolved"
    ).length;
    const resolvedProblems = allProblems.filter(
      (p) => p.status === "resolved"
    ).length;

    const latestProgress =
      entries?.find((e) => e.progress_indicator)?.progress_indicator ?? null;

    const timeline = (entries ?? []).map((entry) => {
      const linkedProblems = (entry.problems_detected ?? []).map(
        (desc: string) => {
        const match = allProblems.find((p) => p.problem_description === desc);
        return {
          description: desc,
          status: match?.status ?? "active",
        };
      }
      );

      return {
        id: entry.id,
        createdAt: entry.created_at,
        entryType: entry.entry_type,
        title: entry.title,
        problems: linkedProblems,
      };
    });

    items.push({
      clientId: client.id,
      clientName: client.name,
      progressIndicator: latestProgress,
      activeProblems,
      resolvedProblems,
      timeline,
    });
  }

  return items;
}

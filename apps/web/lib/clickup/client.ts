const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

export type ClickUpWorkspace = {
  id: string;
  name: string;
};

export type ClickUpList = {
  id: string;
  name: string;
  space?: { name: string };
  folder?: { name: string };
};

export type ClickUpCustomField = {
  id: string;
  name: string;
  type: string;
  value?: unknown;
};

export type ClickUpTask = {
  id: string;
  name: string;
  custom_fields?: ClickUpCustomField[];
};

async function clickupFetch<T>(apiToken: string, path: string): Promise<T> {
  const resp = await fetch(`${CLICKUP_API_BASE}${path}`, {
    headers: { Authorization: apiToken, Accept: "application/json" },
    cache: "no-store",
  });

  const json = (await resp.json().catch(() => null)) as Record<string, unknown> | null;

  if (!resp.ok) {
    const msg = (json?.err as string) ?? (json?.ECODE as string) ?? `ClickUp API error (${resp.status})`;
    throw new Error(msg);
  }

  return json as T;
}

export async function fetchClickUpWorkspaces(apiToken: string): Promise<ClickUpWorkspace[]> {
  const data = await clickupFetch<{ teams?: ClickUpWorkspace[] }>(apiToken, "/team");
  return data.teams ?? [];
}

export async function fetchClickUpLists(apiToken: string, workspaceId: string): Promise<ClickUpList[]> {
  const spaces = await clickupFetch<{ spaces?: { id: string; name: string }[] }>(
    apiToken,
    `/team/${workspaceId}/space?archived=false`
  );

  const lists: ClickUpList[] = [];

  await Promise.all(
    (spaces.spaces ?? []).map(async (space) => {
      try {
        const foldersData = await clickupFetch<{ folders?: { id: string; name: string; lists?: { id: string; name: string }[] }[] }>(
          apiToken,
          `/space/${space.id}/folder?archived=false`
        );
        for (const folder of foldersData.folders ?? []) {
          for (const list of folder.lists ?? []) {
            lists.push({ id: list.id, name: list.name, space: { name: space.name }, folder: { name: folder.name } });
          }
        }
      } catch {
        // ignore spaces with no folder access
      }

      try {
        const listsData = await clickupFetch<{ lists?: { id: string; name: string }[] }>(
          apiToken,
          `/space/${space.id}/list?archived=false`
        );
        for (const list of listsData.lists ?? []) {
          lists.push({ id: list.id, name: list.name, space: { name: space.name } });
        }
      } catch {
        // ignore
      }
    })
  );

  return lists;
}

export async function fetchClickUpTasks(
  apiToken: string,
  listId: string,
  page = 0
): Promise<ClickUpTask[]> {
  const data = await clickupFetch<{ tasks?: ClickUpTask[] }>(
    apiToken,
    `/list/${listId}/task?include_closed=true&page=${page}`
  );
  return data.tasks ?? [];
}

export async function fetchAllClickUpTasks(apiToken: string, listId: string): Promise<ClickUpTask[]> {
  const all: ClickUpTask[] = [];
  let page = 0;
  while (true) {
    const batch = await fetchClickUpTasks(apiToken, listId, page);
    all.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return all;
}

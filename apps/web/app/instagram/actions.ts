"use server";

import { revalidatePath } from "next/cache";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { syncInstagramForOrganization } from "@/lib/instagram/sync";
import { runMutation, type MutationResult } from "@/lib/server/action-result";
import { paths } from "@/routes";

export async function syncInstagramContentAction(): Promise<
  MutationResult<{ synced: number }>
> {
  return runMutation(async () => {
    const organizationId = await requireOrganizationId();
    const result = await syncInstagramForOrganization(organizationId);
    revalidatePath(paths.platform.marketing.content);
    revalidatePath(paths.platform.marketing.overview);
    revalidatePath(paths.platform.integrations);
    return result;
  });
}

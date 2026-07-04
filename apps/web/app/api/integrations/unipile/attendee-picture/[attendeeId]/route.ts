import { NextResponse, type NextRequest } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { fetchUnipileAttendeePicture } from "@/lib/unipile/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ attendeeId: string }> }
) {
  if (!isSupabaseConfigured()) {
    return new NextResponse(null, { status: 503 });
  }

  try {
    const { attendeeId } = await context.params;
    if (!attendeeId?.trim()) {
      return new NextResponse(null, { status: 400 });
    }

    const organizationId = await requireOrganizationId();
    const supabase = await createClient();

    const { data: conversation } = await supabase
      .from("conversations")
      .select("unipile_account_id")
      .eq("organization_id", organizationId)
      .eq("lead_unipile_attendee_id", attendeeId.trim())
      .limit(1)
      .maybeSingle();

    if (!conversation) {
      return new NextResponse(null, { status: 404 });
    }

    const accountIdFromQuery = request.nextUrl.searchParams.get("accountId");
    const accountId =
      accountIdFromQuery?.trim() ||
      (conversation.unipile_account_id as string | null | undefined) ||
      undefined;

    const picture = await fetchUnipileAttendeePicture(
      attendeeId.trim(),
      accountId
    );

    if (!picture) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(picture.buffer, {
      headers: {
        "Content-Type": picture.contentType,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

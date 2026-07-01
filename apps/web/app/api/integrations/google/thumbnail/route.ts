import { type NextRequest, NextResponse } from "next/server";
import { requireOrganizationId } from "@/lib/auth/bootstrap";
import { fetchGoogleDriveThumbnail } from "@/lib/google/drive-content";
import { googleDriveFileIdSchema } from "@/lib/google/drive-schemas";
import { isGooglePermissionError } from "@/lib/google/errors";
import { getGoogleAccessTokenForOrganization } from "@/lib/google/get-access-token";
import { withOAuthNoCache } from "@/lib/integrations/oauth-callback-headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("fileId");
  const parsed = googleDriveFileIdSchema.safeParse(fileId);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const organizationId = await requireOrganizationId();
    const accessToken = await getGoogleAccessTokenForOrganization(organizationId);

    if (!accessToken) {
      return NextResponse.json({ error: "Google no conectado" }, { status: 401 });
    }

    const thumbnail = await fetchGoogleDriveThumbnail(accessToken, parsed.data);
    if (!thumbnail) {
      return new NextResponse(null, { status: 404 });
    }

    return withOAuthNoCache(
      new NextResponse(thumbnail.body, {
        status: 200,
        headers: {
          "Content-Type": thumbnail.contentType,
        },
      })
    );
  } catch (err) {
    if (isGooglePermissionError(err)) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    return new NextResponse(null, { status: 404 });
  }
}

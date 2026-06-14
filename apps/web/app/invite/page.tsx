import { Suspense } from "react";
import { InvitePageContent } from "./invite-page-content";

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <p className="py-12 text-center text-sm text-muted-foreground">
          Cargando invitación…
        </p>
      }
    >
      <InvitePageContent />
    </Suspense>
  );
}

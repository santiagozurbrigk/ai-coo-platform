import { Suspense } from "react";
import { ClosingOverview } from "@/components/closing";
import { PageLoading } from "@/components/shared/page-loading";

export default function ClosingPage() {
  return (
    <Suspense fallback={<PageLoading label="Cargando closing…" />}>
      <ClosingOverview />
    </Suspense>
  );
}

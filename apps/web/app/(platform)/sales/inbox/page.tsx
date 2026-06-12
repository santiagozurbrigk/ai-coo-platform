import { Suspense } from "react";
import { SalesInboxLayout } from "@/components/sales";
import { PageLoading } from "@/components/shared/page-loading";

export default function SalesInboxPage() {
  return (
    <Suspense fallback={<PageLoading label="Cargando bandeja…" />}>
      <SalesInboxLayout />
    </Suspense>
  );
}

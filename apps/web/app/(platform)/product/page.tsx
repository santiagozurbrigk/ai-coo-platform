import { Suspense } from "react";
import { ProductModule } from "@/components/product";

export default function ProductPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
      <ProductModule />
    </Suspense>
  );
}

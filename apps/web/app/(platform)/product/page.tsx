import { Suspense } from "react";
import { ProductModule } from "@/components/product";
import { getProductPageData } from "@/lib/product/queries";

export default async function ProductPage() {
  const { productData, spatialNodes, graphData, hasRealData, canEdit } = await getProductPageData();

  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Cargando…</p>}>
      <ProductModule
        productData={productData}
        spatialNodes={spatialNodes}
        graphData={graphData}
        hasRealData={hasRealData}
        canEdit={canEdit}
      />
    </Suspense>
  );
}

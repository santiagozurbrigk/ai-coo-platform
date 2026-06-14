import { PropositionSection } from "@/components/product";
import { ProductBackLink } from "@/components/product/product-back-link";
import { getProductPageData } from "@/lib/product/queries";

export default async function ProductPropositionPage() {
  const { productData } = await getProductPageData();

  return (
    <div>
      <ProductBackLink />
      <h1 className="mb-6 text-xl font-semibold text-foreground">Propuesta de valor</h1>
      <PropositionSection initial={productData.proposition} />
    </div>
  );
}

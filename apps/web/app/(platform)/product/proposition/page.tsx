import { ProductBackLink, PropositionSection } from "@/components/product";
import { mockProductData } from "@/mocks/product";

export default function ProductPropositionPage() {
  return (
    <div>
      <ProductBackLink />
      <PropositionSection initial={mockProductData.proposition} />
    </div>
  );
}

import { ProductBackLink, ValueLadderSection } from "@/components/product";
import { mockProductData } from "@/mocks/product";

export default function ProductValueLadderPage() {
  return (
    <div>
      <ProductBackLink />
      <h1 className="mb-6 text-xl font-semibold text-foreground">Escalera de valor</h1>
      <ValueLadderSection steps={mockProductData.valueLadder} />
    </div>
  );
}

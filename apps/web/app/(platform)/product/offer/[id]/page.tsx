import { notFound } from "next/navigation";
import { OfferDetail, ProductBackLink } from "@/components/product";
import { mockProductData } from "@/mocks/product";

export default async function ProductOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const offer = mockProductData.offers.find((o) => o.id === id);
  if (!offer) notFound();

  return (
    <div>
      <ProductBackLink />
      <h1 className="mb-6 text-xl font-semibold text-foreground">{offer.name}</h1>
      <OfferDetail offer={offer} />
    </div>
  );
}

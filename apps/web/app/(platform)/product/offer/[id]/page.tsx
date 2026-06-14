import { notFound } from "next/navigation";
import { OfferDetail, ProductBackLink } from "@/components/product";
import { getProductOfferById, getProductPageData } from "@/lib/product/queries";

export default async function ProductOfferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ hasRealData }, offer] = await Promise.all([
    getProductPageData(),
    getProductOfferById(id),
  ]);

  if (!offer) notFound();

  return (
    <div>
      <ProductBackLink />
      <h1 className="mb-6 text-xl font-semibold text-foreground">{offer.name}</h1>
      <OfferDetail offer={offer} hasRealData={hasRealData} />
    </div>
  );
}

import { AdsDashboard } from "@/components/marketing/ads-dashboard";
import { getMarketingAdsAction } from "@/app/marketing/content/ad-actions";

function resolveDefaultDateRange(days = 30) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);

  return {
    fromDate: from.toISOString().slice(0, 10),
    toDate: to.toISOString().slice(0, 10),
  };
}

export default async function MarketingAnunciosPage() {
  const range = resolveDefaultDateRange(30);
  const result = await getMarketingAdsAction(range);

  return (
    <div className="p-6">
      <AdsDashboard
        initialAds={result.ads}
        initialError={result.error ?? null}
        initialRangeDays={30}
      />
    </div>
  );
}

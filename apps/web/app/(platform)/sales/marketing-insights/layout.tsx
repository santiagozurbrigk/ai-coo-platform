import { MarketingSubnav } from "@/components/marketing-insights/marketing-subnav";

export default function MarketingInsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <MarketingSubnav />
      {children}
    </div>
  );
}

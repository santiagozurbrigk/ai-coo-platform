import { MarketingSubnav } from "@/components/marketing/marketing-subnav";

export default function MarketingLayout({
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

import { UTMPageContent } from "@/components/marketing/utm-page-content";
import { PageHeader } from "@/components/shared/page-header";
import { listContentAssetsAction } from "@/app/marketing/actions";
import {
  getOrganizationWebsiteAction,
  getUTMLinksAction,
} from "@/app/marketing/utm-actions";

export default async function MarketingUTMsPage() {
  const [links, assets, orgWebsiteUrl] = await Promise.all([
    getUTMLinksAction(),
    listContentAssetsAction(),
    getOrganizationWebsiteAction(),
  ]);

  const youtubeVideos = assets.filter((a) => a.platform === "youtube");

  return (
    <div className="space-y-6">
      <PageHeader
        title="UTMs de YouTube"
        description="Generá links trackeables y medí qué videos traen leads, bookings y ventas."
      />
      <UTMPageContent
        initialLinks={links}
        youtubeVideos={youtubeVideos}
        orgWebsiteUrl={orgWebsiteUrl}
      />
    </div>
  );
}

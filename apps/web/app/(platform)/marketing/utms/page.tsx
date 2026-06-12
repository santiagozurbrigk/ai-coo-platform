import { UTMPageContent } from "@/components/marketing/utm-page-content";
import { PageHeader } from "@/components/shared/page-header";
import {
  getUTMLinksAction,
  listContentAssetsAction,
} from "@/app/marketing/actions";
import { mockUTMLinks } from "@/mocks/utm-links";

export default async function MarketingUTMsPage() {
  const [links, assets] = await Promise.all([
    getUTMLinksAction(),
    listContentAssetsAction(),
  ]);

  const youtubeVideos = assets.filter((a) => a.platform === "youtube");
  const displayLinks = links.length > 0 ? links : mockUTMLinks;

  return (
    <div className="space-y-6">
      <PageHeader
        title="UTMs de YouTube"
        description="Generá links trackeables y medí qué videos traen leads, bookings y ventas."
      />
      <UTMPageContent
        initialLinks={displayLinks}
        youtubeVideos={youtubeVideos}
      />
    </div>
  );
}

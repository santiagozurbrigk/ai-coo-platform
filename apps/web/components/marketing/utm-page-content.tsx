"use client";

import { useState } from "react";
import type { ContentAssetView } from "@/app/marketing/actions";
import type { UTMLinkRow } from "@/types/utm";
import { UTMGenerator } from "./utm-generator";
import { UTMSetupGuide } from "./utm-setup-guide";
import { UTMTable } from "./utm-table";

export function UTMPageContent({
  initialLinks,
  youtubeVideos,
  orgWebsiteUrl,
}: {
  initialLinks: UTMLinkRow[];
  youtubeVideos: ContentAssetView[];
  orgWebsiteUrl: string | null;
}) {
  const [links, setLinks] = useState(initialLinks);

  return (
    <div className="space-y-6">
      <UTMSetupGuide />

      <div className="grid gap-6 lg:grid-cols-2">
        <UTMGenerator
          youtubeVideos={youtubeVideos}
          orgWebsiteUrl={orgWebsiteUrl}
          onCreated={(link) => setLinks((prev) => [link, ...prev])}
        />
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-medium text-foreground">
              UTMs creados
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Métricas de atribución por video de YouTube.
            </p>
          </div>
          <UTMTable links={links} onLinksChange={setLinks} />
        </div>
      </div>
    </div>
  );
}

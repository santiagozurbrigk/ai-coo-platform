import { AppProviders } from "@/providers";
import { PlatformLayout } from "@/layouts";

export default function PlatformRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <PlatformLayout>{children}</PlatformLayout>
    </AppProviders>
  );
}

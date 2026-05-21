import { FounderLayout } from "@/layouts";

export default function FounderRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FounderLayout>{children}</FounderLayout>;
}

import { SuperAdminLayout } from "@/layouts";

export const dynamic = "force-dynamic";

export default function SuperAdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}

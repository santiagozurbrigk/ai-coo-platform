import { SuperAdminLayout } from "@/layouts";

export default function SuperAdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SuperAdminLayout>{children}</SuperAdminLayout>;
}

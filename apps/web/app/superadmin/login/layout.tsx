import { AuthShell } from "@/components/auth/auth-shell";

export default function SuperAdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}

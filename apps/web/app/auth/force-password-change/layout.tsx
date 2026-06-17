import { AuthShell } from "@/components/auth/auth-shell";

export default function ForcePasswordChangeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}

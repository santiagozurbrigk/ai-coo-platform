import { AuthShell } from "@/components/auth/auth-shell";

export default function UpdatePasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}

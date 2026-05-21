import type { ReactNode } from "react";
import Link from "next/link";
import { Button, Topbar } from "@ai-coo/ui";
import { paths } from "@/routes";

export function FounderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Topbar
        title="Área del fundador"
        subtitle="Vista estratégica de la operación"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={paths.platform.dashboard}>Volver a la plataforma</Link>
          </Button>
        }
      />
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}

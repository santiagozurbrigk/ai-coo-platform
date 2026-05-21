import Link from "next/link";
import { Button } from "@ai-coo/ui";
import { SopGrid } from "@/components/sops";
import { PageHeader } from "@/components/shared";
import { mockSops } from "@/mocks";
import { paths } from "@/routes";

export default function SopLibraryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca de SOPs"
        description="Sistemas operativos vivos de tu negocio"
        actions={
          <Button asChild size="sm">
            <Link href={paths.platform.sops.create}>Crear SOP</Link>
          </Button>
        }
      />
      <SopGrid sops={mockSops} />
    </div>
  );
}

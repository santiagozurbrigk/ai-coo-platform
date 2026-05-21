import { DemoTour } from "@/components/demo";
import { es } from "@/lib/locale/es";

export const metadata = {
  title: `Demo guiada — ${es.app.name}`,
  description: es.demo.subtitle,
};

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-12 lg:px-8">
      <DemoTour />
    </main>
  );
}

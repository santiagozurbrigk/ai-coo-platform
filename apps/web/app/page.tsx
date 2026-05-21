import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge, Button, Text } from "@ai-coo/ui";
import { es } from "@/lib/locale/es";
import { paths } from "@/routes";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(var(--ai) / 0.25), transparent)",
        }}
      />

      <div className="relative z-10 max-w-2xl space-y-8 text-center animate-fade-in">
        <Badge variant="ai">{es.app.phasePrototype} · {es.demo.badge}</Badge>

        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-gradient-ai sm:text-5xl">
            {es.app.name}
          </h1>
          <p className="text-lg text-muted-foreground">{es.app.tagline}</p>
        </div>

        <Text muted className="mx-auto max-w-lg text-sm">
          Prototipo premium con datos mock, flujos conectados y paleta de comandos.
          Ideal para demos, feedback de founders y validación de arquitectura de información.
        </Text>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="gap-2">
            <Link href={paths.demo}>
              <Sparkles className="h-4 w-4" />
              {es.demo.startTour}
            </Link>
          </Button>
          <Button variant="default" asChild size="lg" className="gap-2 bg-primary/90">
            <Link href={paths.platform.dashboard}>
              {es.demo.enterPlatform}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={paths.designSystem}>Sistema de diseño</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href={paths.founder.root}>Área del fundador</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
